// routes/votes.js
const express = require('express');
const router = express.Router();
const { castVote, getMenuVotes, finalizeVoting, getTodayMenus } = require('../controllers/voteController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/today', getTodayMenus);
router.get('/menu/:menuId', optionalAuth, getMenuVotes);
router.post('/cast', protect, authorize('student'), castVote);
router.post('/finalize/:menuId', protect, authorize('admin', 'provider'), finalizeVoting);

module.exports = router;
