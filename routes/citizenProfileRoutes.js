// routes/citizenProfileRoutes.js
const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const citizenProfileController = require("../controllers/citizenProfileController");

router.use(verifyJWT);

router
  .route("/me")
  .get(citizenProfileController.getMyProfile)
  .post(citizenProfileController.createOrUpdateMyProfile);

module.exports = router;