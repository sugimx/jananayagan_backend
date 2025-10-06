const express = require('express');
const router = express.Router();
const {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProfile);
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.delete('/', protect, deleteProfile);

module.exports = router;
