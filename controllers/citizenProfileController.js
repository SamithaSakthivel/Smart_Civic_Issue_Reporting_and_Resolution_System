
const CitizenProfile = require("../models/CitizenProfile");
const User = require("../models/User");

const getMyProfile = async (req, res) => {
  const email = req.user?.userInfo?.email;
  if (!email) {
    console.log("no email");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findOne({ email }).select("_id username email").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  let profile = await CitizenProfile.findOne({ userId: user._id }).lean();

  if (!profile) {
    // return basic skeleton so frontend can display something
    profile = {
      userId: user._id,
      fullName: user.username,
      ward: "",
      phone: "",
      avatarUrl: "",
      address: "",
    };
  }

  res.json({ user, profile });
};

const createOrUpdateMyProfile = async (req, res) => {
  const email = req.user?.userInfo?.email;
  if (!email) return res.status(401).json({ message: "Unauthorized" });

  const user = await User.findOne({ email }).select("_id").lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const { fullName, ward, phone, avatarUrl, address } = req.body;

  const updated = await CitizenProfile.findOneAndUpdate(
    { userId: user._id },
    { fullName, ward, phone, avatarUrl, address, userId: user._id },
    { new: true, upsert: true }          // create if not exists
  ).lean();

  res.json({ profile: updated });
};

module.exports = {
  getMyProfile,
  createOrUpdateMyProfile,
};