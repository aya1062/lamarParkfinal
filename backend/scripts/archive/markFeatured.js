/* ARCHIVED: moved from scripts/markFeatured.js on 2025-11-25 */
const mongoose = require('mongoose');
const Property = require('../models/Property');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lamarPro';
async function markFeatured() { /* original logic retained */ }
module.exports = { markFeatured };
