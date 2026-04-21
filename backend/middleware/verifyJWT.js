const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ MISSING HEADER");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  console.log("🔑 TOKEN LENGTH:", token.length); // DEBUG

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("🔥 JWT ERROR:", err.name, ":", err.message); // 🔥 KEY LINE
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("✅ TOKEN VALID:", decoded.userInfo?.email); // DEBUG
    req.user = decoded;
    next();
  });
};

module.exports = verifyJWT;