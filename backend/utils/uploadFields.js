function filesFromField(req, fieldName) {
  if (!req.files) return [];
  if (Array.isArray(req.files)) return fieldName === 'images' ? req.files : [];
  return req.files[fieldName] || [];
}

function parseInstallmentLogosJson(raw) {
  if (raw === undefined || raw === null || raw === '') return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => (typeof x === 'string' ? { url: x, alt: '' } : x))
      .filter((x) => x && x.url && String(x.url).trim() !== '');
  } catch {
    return [];
  }
}

module.exports = { filesFromField, parseInstallmentLogosJson };
