const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Property = require('../models/Property');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');

async function main() {
	const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lamar';
	await mongoose.connect(MONGO_URI);
	console.log('Connected to MongoDB');

	const [properties, hotels, rooms, pricing, settings] = await Promise.all([
		Property.find({}).lean(),
		Hotel.find({}).lean(),
		Room.find({}).lean(),
		Pricing.find({}).lean(),
		Settings.find({}).lean()
	]);

	const payload = {
		exportedAt: new Date().toISOString(),
		database: MONGO_URI,
		counts: {
			properties: properties.length,
			hotels: hotels.length,
			rooms: rooms.length,
			pricing: pricing.length,
			settings: settings.length
		},
		properties,
		hotels,
		rooms,
		pricing,
		settings
	};

	const outDir = path.join(__dirname, '..', 'exports');
	fs.mkdirSync(outDir, { recursive: true });
	const fileName = `lamar-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
	const outPath = path.join(outDir, fileName);
	fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
	console.log('Exported to:', outPath);

	await mongoose.disconnect();
	process.exit(0);
}

main().catch(async (err) => {
	console.error('Export failed:', err);
	try { await mongoose.disconnect(); } catch {}
	process.exit(1);
});
