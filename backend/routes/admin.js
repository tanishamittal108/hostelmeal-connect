const express = require('express');
const router = express.Router();
const {
  getAllUsers, banUser, unbanUser,
  getPendingProviders, approveProvider, rejectProvider
} = require('../controllers/combinedControllers');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/approve', approveProvider);
router.put('/providers/:id/reject', rejectProvider);

module.exports = router;
