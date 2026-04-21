// routes/councilRoutes.js
const express = require("express");
const router = express.Router();
const { getCouncils } = require("../controllers/councilController");

// usually no auth needed; if you want, you can still keep verifyJWT
router.get("/", getCouncils);

module.exports = router;