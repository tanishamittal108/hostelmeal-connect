const express = require('express');
const router = express.Router();
const { createMenu, updateMenu, publishMenu, getMyMenus, getTodayMenus, getMenu, deleteMenu } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/today', getTodayMenus);
router.get('/provider/my', protect, authorize('provider'), getMyMenus);
router.get('/:id', getMenu);
router.post('/create', protect, authorize('provider'), createMenu);
router.put('/:id', protect, authorize('provider'), updateMenu);
router.put('/:id/publish', protect, authorize('provider'), publishMenu);
router.delete('/:id', protect, authorize('provider'), deleteMenu);

module.exports = router;
