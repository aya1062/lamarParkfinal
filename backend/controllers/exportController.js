const Property = require('../models/Property');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');

// GET /api/export/all
exports.exportAll = async (req, res) => {
	try {
		const [properties, hotels, rooms, pricing, settings] = await Promise.all([
			Property.find({}).lean(),
			Hotel.find({}).lean(),
			Room.find({}).lean(),
			Pricing.find({}).lean(),
			Settings.find({}).lean()
		]);

		const exportedAt = new Date().toISOString();
		const payload = { exportedAt, properties, hotels, rooms, pricing, settings };

		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.setHeader('Content-Disposition', `attachment; filename="lamar-export-${exportedAt}.json"`);
		return res.status(200).send(JSON.stringify(payload, null, 2));
	} catch (error) {
		console.error('Export error:', error);
		return res.status(500).json({ success: false, message: 'Failed to export data', error: error.message });
	}
};
