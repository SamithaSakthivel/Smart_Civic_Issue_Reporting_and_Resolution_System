// middleware/verifyAdmin.js
const User = require("../models/User"); // adjust the path if needed

// allowedRoles can be ["adminCouncil"] or whatever you use
const verifyAdmin =
  (allowedRoles = ["adminCouncil"]) =>
  async (req, res, next) => {
    console.log(req.user);
    try {
      // verifyJWT must have already run and set req.user.userInfo
      const email = req?.user?.userInfo?.email;

      if (!email) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const admin = await User.findOne({ email }).lean().exec();
      if (!admin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userRoles = admin.roles || [];
      const hasRole = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // attach admin doc if you want to use it later
      req.admin = admin;
      next();
    } catch (err) {
      console.error("verifyAdmin error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };

module.exports = verifyAdmin;