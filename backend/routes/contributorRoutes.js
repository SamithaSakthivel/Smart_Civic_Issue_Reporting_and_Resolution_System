// routes/contributorRoutes.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const {
  getMyProfile,
  updateMyProfile,
  getContributorIssues,
  recordContribution,
  getMyContributions,
  getMyStats,
} = require('../controllers/contributorController');

// All contributor routes require authentication
router.use(verifyJWT);

router.get('/profile',           getMyProfile);
router.put('/profile',           updateMyProfile);
router.get('/issues',            getContributorIssues);   // <-- what the frontend calls
router.post('/contribute',       recordContribution);
router.get('/my-contributions',  getMyContributions);
router.get('/stats',             getMyStats);

module.exports = router;