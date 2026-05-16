const QuickLink = require('../models/QuickLink');

// Get all active quick links
exports.getQuickLinks = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const links = await QuickLink.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new quick link
exports.createQuickLink = async (req, res) => {
  try {
    const { name, path, order, isActive } = req.body;
    const link = new QuickLink({ name, path, order, isActive });
    await link.save();
    res.status(201).json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a quick link
exports.updateQuickLink = async (req, res) => {
  try {
    const link = await QuickLink.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!link) {
      return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
    }
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a quick link
exports.deleteQuickLink = async (req, res) => {
  try {
    const link = await QuickLink.findByIdAndDelete(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف الرابط بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
