const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getProviderAnalytics } = require('../controllers/combinedControllers');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/provider', protect, authorize('provider'), getProviderAnalytics);

module.exports = router;
