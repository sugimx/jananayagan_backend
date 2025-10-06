const express = require('express');
const router = express.Router();
const {
  googleAuth,
  linkSocialAccount,
} = require('../controllers/socialAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/google', googleAuth);
router.post('/link-social', protect, linkSocialAccount);

module.exports = router;
