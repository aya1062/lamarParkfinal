const crypto = require('crypto');

function generateUrwayHash({ terminalId, password, trackid, amount, currency, secretKey }) {
  // صيغة شائعة: terminalId|password|trackid|amount|currency|secretKey
  const dataString = `${terminalId}|${password}|${trackid}|${amount}|${currency}|${secretKey}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

module.exports = { generateUrwayHash }; 