const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const googleCallback = async (req, res) => {
  try {
    // passport strategy should set req.user with at least { email, username?, roles? }
    const googleUser = req.user

    if (!googleUser || !googleUser.email) {
      return res.redirect('http://localhost:5173?error=google-auth-failed')
    }

    // find by email
    let user = await User.findOne({ email: googleUser.email }).exec()

    // if user does not exist, create one (no password needed for Google user)
    if (!user) {
      user = await User.create({
        username: googleUser.username || googleUser.email.split('@')[0],
        email: googleUser.email,
        password: await bcrypt.hash(
          googleUser.email + process.env.GOOGLE_SECRET_FALLBACK,
          10
        ), // arbitrary value; not used for Google login, just to satisfy schema
        roles: ['citizen']
      })
    }

    const accessToken = jwt.sign(
      {
        userInfo: {
          id:user._id,
          username: user.username,
          email:user.email,
          roles: user.roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      {
        userInfo: {
          username: user.username
        }
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    // ADD before res.redirect:
const userPayload = {
  username: user.username,
  email: user.email,
  roles: user.roles
}
const encodedUser = encodeURIComponent(JSON.stringify(userPayload))
res.redirect(`http://localhost:5173/oauth-success?token=${accessToken}&user=${encodedUser}`)
  } catch (err) {
    console.error('Google callback error:', err)
    res.redirect('http://localhost:5173?error=google-auth-failed')
  }
}


const register = async (req, res) => {
  const { username, password, roles, email, councilName, captchaToken } = req.body;
  console.log("REGISTER BODY:", req.body);

  // 1️⃣ Check captcha token presence
  if (!captchaToken) {
    return res.status(400).json({ message: "Captcha verification is required" });
  }

  try {
    // 2️⃣ Verify captcha with Google
    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET);
    params.append("response", captchaToken);

    const captchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    const captchaData = await captchaRes.json();
    console.log("reCAPTCHA result:", captchaData);

    // For v3 you also get `score` (0–1). Many apps use 0.5 as cutoff.  
    if (!captchaData.success || (captchaData.score && captchaData.score < 0.5)) {
      return res
        .status(400)
        .json({ message: "Captcha verification failed, please try again" });
    }

    // 3️⃣ Existing validation
    if (!username || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (roles?.includes("adminCouncil") && !councilName) {
      return res
        .status(400)
        .json({ message: "Council name is required for adminCouncil" });
    }

    const duplicateUser = await User.findOne({ username }).lean().exec();
    if (duplicateUser) {
      return res.status(409).json({ message: "Username taken" });
    }

    const duplicateEmail = await User.findOne({ email }).lean().exec();
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = {
      username,
      email,
      password: hashedPwd,
      roles: roles && roles.length ? roles : ["citizen"],
    };

    if (roles?.includes("adminCouncil")) {
      userObject.councilName = councilName;
    }

    const user = await User.create(userObject);

    return res
      .status(201)
      .json({ message: `username ${user.username} is created` });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'all fields are required' })
  }

  const foundUser = await User.findOne({ email }).exec()
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'unauthorized access' })
  }

  const passwordMatch = await bcrypt.compare(password, foundUser.password)
  if (!passwordMatch) {
    return res.status(401).json({ message: 'unauthorised access' })
  }

  const payloadUser={
    username:foundUser.username,
    email:foundUser.email,
    roles:foundUser.roles
  }
  const accessToken = jwt.sign(
    {
      userInfo: {
        id:foundUser._id,
        username: foundUser.username,
        roles: foundUser.roles,
        email:foundUser.email
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userInfo: { username: foundUser.username } },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return res.json({ accessToken,user:payloadUser})
}

const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({
        username: decoded?.userInfo?.username,
      }).lean();
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = jwt.sign(
        {
          userInfo: {
            id: foundUser._id,
            username: foundUser.username,
            email: foundUser.email,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const payloadUser = {
        username: foundUser.username,
        email: foundUser.email,
        roles: foundUser.roles,
      };

      res.json({ accessToken, user: payloadUser });
    }
  );
};

const logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax' });
    res.json({ message: 'success' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};


module.exports = { googleCallback, register, login, refresh, logout };