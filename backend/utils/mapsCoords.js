/**
 * استخراج ومعالجة إحداثيات فروع الخريطة من روابط Google Maps والعنوان.
 */

const CITY_COORDS = {
  تبوك: { lat: 28.3998, lng: 36.5785 },
  tabuk: { lat: 28.3998, lng: 36.5785 },
  الرياض: { lat: 24.7136, lng: 46.6753 },
  riyadh: { lat: 24.7136, lng: 46.6753 },
  جدة: { lat: 21.4858, lng: 39.1925 },
  jeddah: { lat: 21.4858, lng: 39.1925 },
  مكة: { lat: 21.3891, lng: 39.8579 },
  makkah: { lat: 21.3891, lng: 39.8579 },
  mecca: { lat: 21.3891, lng: 39.8579 },
  المدينة: { lat: 24.5247, lng: 39.5692 },
  madinah: { lat: 24.5247, lng: 39.5692 },
  الدمام: { lat: 26.4207, lng: 50.0888 },
  dammam: { lat: 26.4207, lng: 50.0888 },
  الخبر: { lat: 26.2172, lng: 50.1971 },
  khobar: { lat: 26.2172, lng: 50.1971 },
  أبها: { lat: 18.2164, lng: 42.5053 },
  abha: { lat: 18.2164, lng: 42.5053 },
  الطائف: { lat: 21.2703, lng: 40.4158 },
  taif: { lat: 21.2703, lng: 40.4158 },
  ينبع: { lat: 24.0895, lng: 38.0618 },
  yanbu: { lat: 24.0895, lng: 38.0618 },
  العلا: { lat: 26.6143, lng: 37.9236 },
  alula: { lat: 26.6143, lng: 37.9236 },
  حائل: { lat: 27.5114, lng: 41.7208 },
  hail: { lat: 27.5114, lng: 41.7208 },
  جازان: { lat: 16.8894, lng: 42.5706 },
  jazan: { lat: 16.8894, lng: 42.5706 },
  نيوم: { lat: 28.2934, lng: 34.7785 },
  neom: { lat: 28.2934, lng: 34.7785 }
};

function isValidLatLng(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function parseCoordNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : NaN;
}

function isMapsLikeUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.toLowerCase();
  return (
    v.includes('google.com/maps') ||
    v.includes('maps.google') ||
    v.includes('goo.gl/maps') ||
    v.includes('maps.app.goo.gl') ||
    v.includes('maps.app.goo') ||
    v.startsWith('geo:')
  );
}

function getMapsUrlFromHotel(hotel) {
  const contactUrl = hotel?.contact?.mapsUrl;
  if (contactUrl && String(contactUrl).trim()) return String(contactUrl).trim();
  const location = hotel?.location;
  if (isMapsLikeUrl(location)) return String(location).trim();
  return null;
}

function isShortMapsUrl(url) {
  return /(?:goo\.gl\/maps|maps\.app\.goo\.gl|maps\.app\.goo)/i.test(url);
}

function extractFromGoogleDataBlob(raw) {
  const latMatch = raw.match(/[!]3d(-?\d+(?:\.\d+)?)/i);
  const lngMatch = raw.match(/[!]4d(-?\d+(?:\.\d+)?)/i);
  if (latMatch && lngMatch) {
    const lat = Number(latMatch[1]);
    const lng = Number(lngMatch[1]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  const lng2d = raw.match(/[!]2d(-?\d+(?:\.\d+)?)/i);
  const lat3d = raw.match(/[!]3d(-?\d+(?:\.\d+)?)/i);
  if (lng2d && lat3d) {
    const lat = Number(lat3d[1]);
    const lng = Number(lng2d[1]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function extractLatLngFromMapsUrl(mapsUrl) {
  if (!mapsUrl || typeof mapsUrl !== 'string') return null;
  const raw = mapsUrl.trim();
  if (!raw) return null;

  if (raw.startsWith('geo:')) {
    const geoMatch = raw.match(/geo:([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)/i);
    if (geoMatch) {
      const lat = Number(geoMatch[1]);
      const lng = Number(geoMatch[2]);
      if (isValidLatLng(lat, lng)) return { lat, lng };
    }
  }

  const dataBlob = extractFromGoogleDataBlob(raw);
  if (dataBlob) return dataBlob;

  const placeMatch = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i);
  if (placeMatch) {
    const lat = Number(placeMatch[1]);
    const lng = Number(placeMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lng = Number(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const paramNames = ['q', 'query', 'll', 'center', 'destination', 'daddr', 'sll'];
    for (const name of paramNames) {
      const val = parsed.searchParams.get(name);
      if (!val) continue;
      const coordMatch = val.match(/([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)/);
      if (coordMatch) {
        const lat = Number(coordMatch[1]);
        const lng = Number(coordMatch[2]);
        if (isValidLatLng(lat, lng)) return { lat, lng };
      }
    }

    const pathMatch = parsed.pathname.match(/([+-]?\d+(?:\.\d+)?),\s*([+-]?\d+(?:\.\d+)?)/);
    if (pathMatch) {
      const lat = Number(pathMatch[1]);
      const lng = Number(pathMatch[2]);
      if (isValidLatLng(lat, lng)) return { lat, lng };
    }

    const mapsSegmentMatch = parsed.pathname.match(/\/maps\/(?:search|dir|place)\/([^/]+)/i);
    if (mapsSegmentMatch) {
      const segment = decodeURIComponent(mapsSegmentMatch[1]);
      const segmentCoord = segment.match(/([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)/);
      if (segmentCoord) {
        const lat = Number(segmentCoord[1]);
        const lng = Number(segmentCoord[2]);
        if (isValidLatLng(lat, lng)) return { lat, lng };
      }
    }
  } catch {
    // تجاهل
  }

  return null;
}

function getStoredCoordinates(hotel) {
  const lat = parseCoordNumber(hotel?.address?.coordinates?.latitude);
  const lng = parseCoordNumber(hotel?.address?.coordinates?.longitude);
  if (isValidLatLng(lat, lng)) return { lat, lng, source: 'stored' };
  return null;
}

function getCityFallbackCoordinates(hotel) {
  const candidates = [hotel?.address?.city, hotel?.location, hotel?.address?.state]
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase());

  for (const candidate of candidates) {
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (candidate.includes(key.toLowerCase()) || key.toLowerCase().includes(candidate)) {
        return { lat: coords.lat, lng: coords.lng, source: 'city', approximate: true };
      }
    }
  }
  return null;
}

async function resolveMapsUrlRedirect(mapsUrl) {
  if (!isShortMapsUrl(mapsUrl)) return mapsUrl;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(mapsUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'LamarParkMapResolver/1.0' }
    });
    clearTimeout(timeout);
    return res.url || mapsUrl;
  } catch {
    return mapsUrl;
  }
}

/**
 * يحسب موضع الفرع على الخريطة (متزامن — بدون فتح الروابط المختصرة).
 */
function getHotelMapPositionSync(hotel) {
  const stored = getStoredCoordinates(hotel);
  if (stored) return stored;

  const mapsUrl = getMapsUrlFromHotel(hotel);
  if (mapsUrl) {
    const fromUrl = extractLatLngFromMapsUrl(mapsUrl);
    if (fromUrl) return { ...fromUrl, source: 'url' };
  }

  return getCityFallbackCoordinates(hotel);
}

/**
 * يحسب موضع الفرع مع فتح الروابط المختصرة عند الحاجة.
 */
async function getHotelMapPosition(hotel) {
  const stored = getStoredCoordinates(hotel);
  if (stored) return stored;

  let mapsUrl = getMapsUrlFromHotel(hotel);
  if (mapsUrl) {
    if (isShortMapsUrl(mapsUrl)) {
      mapsUrl = await resolveMapsUrlRedirect(mapsUrl);
    }
    const fromUrl = extractLatLngFromMapsUrl(mapsUrl);
    if (fromUrl) return { ...fromUrl, source: 'url' };
  }

  return getCityFallbackCoordinates(hotel);
}

function applyMapsCoordinatesToAddress(contact, address, options = {}) {
  const addr = { ...(address || {}) };
  const lat = parseCoordNumber(addr.coordinates?.latitude);
  const lng = parseCoordNumber(addr.coordinates?.longitude);
  const hasManual = isValidLatLng(lat, lng);

  const extracted = extractLatLngFromMapsUrl(contact?.mapsUrl);
  if (!extracted) return addr;

  if (options.forceFromMapsUrl || !hasManual) {
    addr.coordinates = { latitude: extracted.lat, longitude: extracted.lng };
  }
  return addr;
}

module.exports = {
  extractLatLngFromMapsUrl,
  applyMapsCoordinatesToAddress,
  getHotelMapPosition,
  getHotelMapPositionSync,
  getMapsUrlFromHotel,
  isValidLatLng,
  parseCoordNumber,
  resolveMapsUrlRedirect,
  isShortMapsUrl
};
