const Menu = require('../models/Menu');
const { Subscription, Notification } = require('../models/index');
const logger = require('./logger');

// Finalize all open voting menus at 7 PM
const finalizeVoting = async () => {
  try {
    const now = new Date();
    const openMenus = await Menu.find({ status: 'voting_open', votingCloseAt: { $lte: now } });

    for (const menu of openMenus) {
      // Sort and pick top dishes
      const topSabji = [...menu.sabjiOptions].sort((a, b) => b.voteCount - a.voteCount).slice(0, 3);
      const topSweet = [...menu.sweetDishOptions].sort((a, b) => b.voteCount - a.voteCount)[0];
      const topDal = menu.dalOptions.length ? [...menu.dalOptions].sort((a, b) => b.voteCount - a.voteCount)[0] : null;
      const topRoti = menu.rotiRiceOptions.length ? [...menu.rotiRiceOptions].sort((a, b) => b.voteCount - a.voteCount)[0] : null;

      let demandMultiplier = 1.0;
      if (menu.totalVotesCast > 50) demandMultiplier = 1.1;
      if (menu.totalVotesCast > 100) demandMultiplier = 1.2;

      menu.finalizedMenu = {
        selectedSabji: topSabji.map(s => s._id),
        selectedDal: topDal?._id,
        selectedRotiRice: topRoti?._id,
        selectedSweetDish: topSweet?._id,
        finalizedAt: new Date(),
      };
      menu.finalPrice = Math.round(menu.basePrice * demandMultiplier);
      menu.pricingFactors.demandMultiplier = demandMultiplier;
      menu.status = 'finalized';
      await menu.save();

      logger.info(`Menu ${menu._id} finalized with ${menu.totalVotesCast} votes`);
    }

    logger.info(`Finalized ${openMenus.length} menus`);
  } catch (error) {
    logger.error(`Cron - finalizeVoting error: ${error.message}`);
  }
};

// Open voting for tomorrow's menus at 6 PM
const openVoting = async () => {
  try {
    const now = new Date();
    const menus = await Menu.find({ status: 'draft', votingOpenAt: { $lte: now }, votingCloseAt: { $gte: now } });

    for (const menu of menus) {
      menu.status = 'voting_open';
      await menu.save();
    }

    logger.info(`Opened voting for ${menus.length} menus`);
  } catch (error) {
    logger.error(`Cron - openVoting error: ${error.message}`);
  }
};

// Send subscription reminders
const sendSubscriptionReminders = async () => {
  try {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const expiringSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lte: threeDaysFromNow, $gte: new Date() },
    }).populate('student', 'name');

    for (const sub of expiringSubscriptions) {
      await Notification.create({
        recipient: sub.student._id,
        title: '⏰ Subscription Expiring Soon!',
        message: `Your meal subscription expires in 3 days. Renew to continue enjoying home-cooked meals!`,
        type: 'subscription',
        data: { subscriptionId: sub._id },
      });
    }

    logger.info(`Sent ${expiringSubscriptions.length} subscription reminders`);
  } catch (error) {
    logger.error(`Cron - sendSubscriptionReminders error: ${error.message}`);
  }
};

// Mark expired subscriptions
const markExpiredSubscriptions = async () => {
  try {
    const result = await Subscription.updateMany(
      { status: 'active', endDate: { $lt: new Date() } },
      { status: 'expired' }
    );
    logger.info(`Marked ${result.modifiedCount} subscriptions as expired`);
  } catch (error) {
    logger.error(`Cron - markExpiredSubscriptions error: ${error.message}`);
  }
};

// Generate daily report
const generateDailyReport = async () => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();

    const [orders, revenue, newUsers] = await Promise.all([
      require('../models/Order').countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      require('../models/Order').aggregate([
        { $match: { createdAt: { $gte: yesterday, $lt: today }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      require('../models/User').countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    ]);

    logger.info(`Daily Report: Orders=${orders}, Revenue=₹${revenue[0]?.total || 0}, NewUsers=${newUsers}`);
  } catch (error) {
    logger.error(`Cron - generateDailyReport error: ${error.message}`);
  }
};

module.exports = { finalizeVoting, openVoting, sendSubscriptionReminders, markExpiredSubscriptions, generateDailyReport };
