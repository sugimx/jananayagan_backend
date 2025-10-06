const express = require('express');
const router = express.Router();
const {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAddress);
router.get('/', protect, getAddresses);
router.get('/:id', protect, getAddress);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

module.exports = router;
