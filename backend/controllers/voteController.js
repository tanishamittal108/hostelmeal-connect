const Menu = require('../models/Menu');
const Vote = require('../models/Vote');
const { Notification } = require('../models/index');
const { getIO } = require('../socket/socketManager');

// @POST /api/votes/cast
exports.castVote = async (req, res, next) => {
  try {
    const { menuId, selectedSabji, selectedSweetDish, selectedDal, selectedRotiRice } = req.body;
    const studentId = req.user._id;

    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    if (menu.status !== 'voting_open') {
      return res.status(400).json({ success: false, message: 'Voting is not open for this menu' });
    }

    const now = new Date();
    if (now < menu.votingOpenAt || now > menu.votingCloseAt) {
      return res.status(400).json({ success: false, message: 'Voting window is closed' });
    }

    if (!selectedSabji || selectedSabji.length < 1 || selectedSabji.length > 3) {
      return res.status(400).json({ success: false, message: 'Select 1-3 sabji options' });
    }
    if (!selectedSweetDish) {
      return res.status(400).json({ success: false, message: 'Please select a sweet dish' });
    }

    const existingVote = await Vote.findOne({ student: studentId, menu: menuId });
    if (existingVote) {
      // Update vote
      const oldSabji = existingVote.selectedSabji;
      const oldSweet = existingVote.selectedSweetDish;

      // Decrement old votes
      for (const opt of menu.sabjiOptions) {
        if (oldSabji.some(id => id.toString() === opt._id.toString())) opt.voteCount = Math.max(0, opt.voteCount - 1);
        if (selectedSabji.includes(opt._id.toString())) opt.voteCount += 1;
      }
      for (const opt of menu.sweetDishOptions) {
        if (opt._id.toString() === oldSweet.toString()) opt.voteCount = Math.max(0, opt.voteCount - 1);
        if (opt._id.toString() === selectedSweetDish) opt.voteCount += 1;
      }

      existingVote.selectedSabji = selectedSabji;
      existingVote.selectedSweetDish = selectedSweetDish;
      existingVote.selectedDal = selectedDal;
      existingVote.selectedRotiRice = selectedRotiRice;
      existingVote.votedAt = new Date();
      await existingVote.save();
    } else {
      // New vote
      for (const opt of menu.sabjiOptions) {
        if (selectedSabji.includes(opt._id.toString())) opt.voteCount += 1;
      }
      for (const opt of menu.sweetDishOptions) {
        if (opt._id.toString() === selectedSweetDish) opt.voteCount += 1;
      }
      if (selectedDal) {
        for (const opt of menu.dalOptions) {
          if (opt._id.toString() === selectedDal) opt.voteCount += 1;
        }
      }
      if (selectedRotiRice) {
        for (const opt of menu.rotiRiceOptions) {
          if (opt._id.toString() === selectedRotiRice) opt.voteCount += 1;
        }
      }
      menu.totalVotesCast += 1;

      await Vote.create({
        student: studentId,
        menu: menuId,
        provider: menu.provider,
        selectedSabji,
        selectedSweetDish,
        selectedDal,
        selectedRotiRice,
      });
    }

    await menu.save();

    // Emit real-time update
    const io = getIO();
    io.to(`menu_${menuId}`).emit('vote_update', {
      menuId,
      sabjiOptions: menu.sabjiOptions.map(o => ({ _id: o._id, name: o.name, voteCount: o.voteCount })),
      sweetDishOptions: menu.sweetDishOptions.map(o => ({ _id: o._id, name: o.name, voteCount: o.voteCount })),
      totalVotesCast: menu.totalVotesCast,
    });

    res.json({ success: true, message: 'Vote cast successfully!' });
  } catch (error) {
    next(error);
  }
};

// @GET /api/votes/menu/:menuId
exports.getMenuVotes = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    const userVote = req.user
      ? await Vote.findOne({ student: req.user._id, menu: menu._id })
      : null;

    res.json({
      success: true,
      data: {
        menuId: menu._id,
        status: menu.status,
        votingOpenAt: menu.votingOpenAt,
        votingCloseAt: menu.votingCloseAt,
        totalVotesCast: menu.totalVotesCast,
        sabjiOptions: menu.sabjiOptions,
        sweetDishOptions: menu.sweetDishOptions,
        dalOptions: menu.dalOptions,
        rotiRiceOptions: menu.rotiRiceOptions,
        userVote: userVote || null,
        finalizedMenu: menu.status === 'finalized' ? menu.finalizedMenu : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/votes/finalize/:menuId (Admin/Cron)
exports.finalizeVoting = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId).populate('provider');
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    if (menu.status !== 'voting_open') {
      return res.status(400).json({ success: false, message: 'Menu is not in voting state' });
    }

    // Sort and pick winners
    const topSabji = [...menu.sabjiOptions].sort((a, b) => b.voteCount - a.voteCount).slice(0, 3);
    const topSweet = [...menu.sweetDishOptions].sort((a, b) => b.voteCount - a.voteCount)[0];
    const topDal = menu.dalOptions.length
      ? [...menu.dalOptions].sort((a, b) => b.voteCount - a.voteCount)[0]
      : null;
    const topRoti = menu.rotiRiceOptions.length
      ? [...menu.rotiRiceOptions].sort((a, b) => b.voteCount - a.voteCount)[0]
      : null;

    // Dynamic pricing
    let demandMultiplier = 1.0;
    if (menu.totalVotesCast > 50) demandMultiplier = 1.1;
    if (menu.totalVotesCast > 100) demandMultiplier = 1.2;

    const specialSurcharge = topSweet?.name?.toLowerCase().includes('gulab') ? 10 : 0;
    const finalPrice = Math.round(menu.basePrice * demandMultiplier + specialSurcharge);

    menu.finalizedMenu = {
      selectedSabji: topSabji.map(s => s._id),
      selectedDal: topDal?._id,
      selectedRotiRice: topRoti?._id,
      selectedSweetDish: topSweet?._id,
      finalizedAt: new Date(),
    };
    menu.finalPrice = finalPrice;
    menu.pricingFactors = { demandMultiplier, specialDishSurcharge: specialSurcharge, discountApplied: 0 };
    menu.status = 'finalized';
    await menu.save();

    // Emit finalized event
    const io = getIO();
    io.to(`provider_${menu.provider._id}`).emit('menu_finalized', { menu });
    io.emit('menu_finalized_global', {
      menuId: menu._id,
      providerId: menu.provider._id,
      finalPrice,
      finalizedMenu: menu.finalizedMenu,
    });

    res.json({ success: true, message: 'Menu finalized successfully', data: menu });
  } catch (error) {
    next(error);
  }
};

// @GET /api/votes/today
exports.getTodayMenus = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['voting_open', 'finalized', 'voting_closed'] },
    }).populate({
      path: 'provider',
      populate: { path: 'user', select: 'name avatar' },
    });

    res.json({ success: true, count: menus.length, data: menus });
  } catch (error) {
    next(error);
  }
};
