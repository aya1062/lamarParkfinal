const Settings = require('../models/Settings');

// Get current settings (create defaults if none)
exports.getSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			settings = await Settings.create({});
		}
		res.json({ success: true, data: settings });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Update settings (admin)
exports.updateSettings = async (req, res) => {
	try {
		let settings = await Settings.findOne();
		if (!settings) {
			settings = new Settings({});
		}

		// Shallow merge top-level groups provided in body
		const allowedKeys = ['general', 'booking', 'payment', 'notifications'];
		for (const key of allowedKeys) {
			if (req.body[key]) {
				settings[key] = { ...settings[key]?.toObject?.() || settings[key] || {}, ...req.body[key] };
			}
		}

		await settings.save();
		res.json({ success: true, data: settings });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
