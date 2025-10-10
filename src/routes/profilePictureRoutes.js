const express = require('express');
const router = express.Router();
const {
  uploadUserProfilePicture,
  uploadBuyerProfilePicture,
  getUserProfilePicture,
  getBuyerProfilePicture,
  deleteUserProfilePicture,
  deleteBuyerProfilePicture,
} = require('../controllers/profilePictureController');
const { protect } = require('../middleware/authMiddleware');

// User profile picture routes
router.post('/user', protect, uploadUserProfilePicture);
router.get('/user', protect, getUserProfilePicture);
router.delete('/user', protect, deleteUserProfilePicture);

// Buyer profile picture routes
router.post('/buyer', protect, uploadBuyerProfilePicture);
router.get('/buyer', protect, getBuyerProfilePicture);
router.delete('/buyer', protect, deleteBuyerProfilePicture);

module.exports = router;





