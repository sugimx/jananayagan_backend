const express = require('express');
const router = express.Router();
const {
  // User Profile
  getUserProfile,
  updateUserProfile,
  
  // Buyer Profiles
  createBuyerProfile,
  getBuyerProfiles,
  updateBuyerProfile,
  deleteBuyerProfile,
  
  // Get All Profiles
  getAllProfiles,
  
  // Legacy endpoints
  getProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// ==================== USER PROFILE ROUTES ====================
router.get('/user', protect, getUserProfile);
router.put('/user', protect, updateUserProfile);

// ==================== BUYER PROFILE ROUTES ====================
router.post('/buyer', protect, createBuyerProfile);
router.get('/buyer', protect, getBuyerProfiles);
router.put('/buyer/:id', protect, updateBuyerProfile);
router.delete('/buyer/:id', protect, deleteBuyerProfile);

// ==================== GET ALL PROFILES ====================
router.get('/all', protect, getAllProfiles);

// ==================== LEGACY ROUTES (backward compatibility) ====================
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.delete('/', protect, deleteProfile);

module.exports = router;
