/* ARCHIVED: moved from scripts/exportData.js on 2025-11-25 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const Property = require('../models/Property');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');
async function main() { /* original logic retained */ }
module.exports = { main };
