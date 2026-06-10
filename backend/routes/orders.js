// routes/orders.js
const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, updateOrderStatus,
  verifyDelivery, cancelOrder, getProviderOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', protect, authorize('student'), createOrder);
router.get('/my', protect, getMyOrders);
router.get('/provider/active', protect, authorize('provider'), getProviderOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('provider', 'delivery', 'admin'), updateOrderStatus);
router.post('/:id/verify-delivery', protect, authorize('delivery'), verifyDelivery);
router.post('/:id/cancel', protect, cancelOrder);

module.exports = router;
