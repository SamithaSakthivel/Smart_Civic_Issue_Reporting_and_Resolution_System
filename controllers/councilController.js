// controllers/councilController.js
const User = require("../models/User");

const getCouncils = async (req, res) => {
  try {
    const councils = await User.find({
      roles: "adminCouncil",
      councilName: { $exists: true, $ne: "" },
    })
      .select("_id councilName")
      .lean();

      console.log(councils);
    res.json(councils);
  } catch (err) {
    console.error("getCouncils error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getCouncils };