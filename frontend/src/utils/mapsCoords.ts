export type LatLng = { lat: number; lng: number };

export type MapPosition = LatLng & {
  source?: 'stored' | 'url' | 'city';
  approximate?: boolean;
};

export type HotelMapSource = {
  location?: string;
  address?: {
    city?: string;
    state?: string;
    coordinates?: {
      latitude?: number | string;
      longitude?: number | string;
    };
  };
  contact?: {
    mapsUrl?: string;
  };
  mapPosition?: MapPosition | null;
};

const CITY_COORDS: Record<string, LatLng> = {
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

function isValidLatLng(lat: number, lng: number): boolean {
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

function parseCoordNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return NaN;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : NaN;
}

function isMapsLikeUrl(value?: string): boolean {
  if (!value) return false;
  const v = value.toLowerCase();
  return (
    v.includes('google.com/maps') ||
    v.includes('maps.google') ||
    v.includes('goo.gl/maps') ||
    v.includes('maps.app.goo.gl') ||
    v.startsWith('geo:')
  );
}

export function getMapsUrlFromHotel(hotel: HotelMapSource): string | null {
  const contactUrl = hotel?.contact?.mapsUrl;
  if (contactUrl?.trim()) return contactUrl.trim();
  if (isMapsLikeUrl(hotel?.location)) return hotel.location!.trim();
  return null;
}

function extractFromGoogleDataBlob(raw: string): LatLng | null {
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

/** استخراج lat/lng من رابط Google Maps */
export function extractLatLngFromMapsUrl(mapsUrl?: string): LatLng | null {
  if (!mapsUrl) return null;
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
    // ignore
  }

  return null;
}

function getStoredCoordinates(hotel: HotelMapSource): MapPosition | null {
  const lat = parseCoordNumber(hotel?.address?.coordinates?.latitude);
  const lng = parseCoordNumber(hotel?.address?.coordinates?.longitude);
  if (isValidLatLng(lat, lng)) return { lat, lng, source: 'stored' };
  return null;
}

function getCityFallbackCoordinates(hotel: HotelMapSource): MapPosition | null {
  const candidates = [hotel?.address?.city, hotel?.location, hotel?.address?.state]
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase());

  for (const candidate of candidates) {
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (candidate.includes(key.toLowerCase()) || key.toLowerCase().includes(candidate)) {
        return { ...coords, source: 'city', approximate: true };
      }
    }
  }
  return null;
}

/** موضع الفرع: من السيرفر أو محلي (إحداثيات / رابط / مدينة) */
export function getHotelMapLatLng(hotel: HotelMapSource): MapPosition | null {
  if (hotel.mapPosition && isValidLatLng(hotel.mapPosition.lat, hotel.mapPosition.lng)) {
    return hotel.mapPosition;
  }

  const stored = getStoredCoordinates(hotel);
  if (stored) return stored;

  const mapsUrl = getMapsUrlFromHotel(hotel);
  if (mapsUrl) {
    const fromUrl = extractLatLngFromMapsUrl(mapsUrl);
    if (fromUrl) return { ...fromUrl, source: 'url' };
  }

  return getCityFallbackCoordinates(hotel);
}

export function hotelHasMapLocation(hotel: HotelMapSource): boolean {
  return getHotelMapLatLng(hotel) !== null;
}

/** فصل العلامات المتطابقة تقريباً (نفس المدينة مثلاً) */
export function spreadOverlappingPosition(
  position: LatLng,
  index: number,
  totalAtSameSpot: number
): LatLng {
  if (totalAtSameSpot <= 1) return position;
  const angle = (index / totalAtSameSpot) * 2 * Math.PI;
  const radius = 0.012;
  return {
    lat: position.lat + radius * Math.cos(angle),
    lng: position.lng + radius * Math.sin(angle)
  };
}
