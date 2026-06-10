const Menu = require('../models/Menu');
const Provider = require('../models/Provider');
const { Notification } = require('../models/index');
const { getIO } = require('../socket/socketManager');

// @POST /api/menu/create
exports.createMenu = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });
    if (provider.status !== 'approved') return res.status(403).json({ success: false, message: 'Provider not approved yet' });

    const { date, sabjiOptions, dalOptions, rotiRiceOptions, sweetDishOptions, basePrice, isSpecialDay, specialDayNote } = req.body;

    const menuDate = new Date(date);
    menuDate.setHours(0, 0, 0, 0);

    // Check if menu already exists for this date
    const existing = await Menu.findOne({ provider: provider._id, date: menuDate });
    if (existing) return res.status(400).json({ success: false, message: 'Menu already exists for this date' });

    // Voting window: 6 PM - 7 PM on the day before
    const votingOpen = new Date(menuDate);
    votingOpen.setDate(votingOpen.getDate() - 1);
    votingOpen.setHours(18, 0, 0, 0);

    const votingClose = new Date(votingOpen);
    votingClose.setHours(19, 0, 0, 0);

    const menu = await Menu.create({
      provider: provider._id,
      date: menuDate,
      sabjiOptions,
      dalOptions: dalOptions || [],
      rotiRiceOptions: rotiRiceOptions || [],
      sweetDishOptions,
      basePrice: basePrice || provider.basePrice,
      isSpecialDay: isSpecialDay || false,
      specialDayNote,
      status: 'draft',
      votingOpenAt: votingOpen,
      votingCloseAt: votingClose,
      deliveryStartTime: new Date(menuDate.setHours(20, 0, 0, 0)),
      deliveryEndTime: new Date(menuDate.setHours(21, 0, 0, 0)),
    });

    provider.totalMenusPosted += 1;
    await provider.save();

    res.status(201).json({ success: true, message: 'Menu created successfully', data: menu });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/menu/:id
exports.updateMenu = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const menu = await Menu.findOne({ _id: req.params.id, provider: provider._id });

    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    if (menu.status !== 'draft') return res.status(400).json({ success: false, message: 'Cannot edit a published menu' });

    Object.assign(menu, req.body);
    await menu.save();

    res.json({ success: true, message: 'Menu updated', data: menu });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/menu/:id/publish
exports.publishMenu = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const menu = await Menu.findOne({ _id: req.params.id, provider: provider._id });

    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    if (menu.status !== 'draft') return res.status(400).json({ success: false, message: 'Menu already published' });

    menu.status = 'voting_open';
    await menu.save();

    // Notify subscribed students (simplified)
    const io = getIO();
    io.emit('new_menu_published', {
      providerId: provider._id,
      menuId: menu._id,
      providerName: provider.businessName,
      date: menu.date,
    });

    res.json({ success: true, message: 'Menu published! Voting is now open.', data: menu });
  } catch (error) {
    next(error);
  }
};

// @GET /api/menu/provider/my
exports.getMyMenus = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const menus = await Menu.find({ provider: provider._id }).sort({ date: -1 }).limit(30);
    res.json({ success: true, data: menus });
  } catch (error) {
    next(error);
  }
};

// @GET /api/menu/today
exports.getTodayMenus = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
    }).populate({
      path: 'provider',
      select: 'businessName kitchenAddress avgRating kitchenPhotos basePrice finalPrice',
      populate: { path: 'user', select: 'name avatar' },
    });

    res.json({ success: true, count: menus.length, data: menus });
  } catch (error) {
    next(error);
  }
};

// @GET /api/menu/:id
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id).populate({
      path: 'provider',
      populate: { path: 'user', select: 'name avatar phone' },
    });

    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

// @DELETE /api/menu/:id
exports.deleteMenu = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const menu = await Menu.findOneAndDelete({ _id: req.params.id, provider: provider._id, status: 'draft' });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found or cannot be deleted' });
    res.json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    next(error);
  }
};
