// routes/wallet.js
const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet, confirmWalletTopUp } = require('../controllers/combinedControllers');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWallet);
router.post('/topup', protect, topUpWallet);
router.post('/topup/confirm', protect, confirmWalletTopUp);

module.exports = router;
