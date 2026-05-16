import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, Marker, Tooltip, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../utils/api';
import {
  getHotelMapLatLng,
  hotelHasMapLocation,
  spreadOverlappingPosition,
  type LatLng,
  type MapPosition
} from '../../utils/mapsCoords';

type HotelBranch = {
  _id: string;
  name: string;
  type: 'hotel' | 'resort';
  location?: string;
  address?: {
    city?: string;
    country?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  contact?: {
    mapsUrl?: string;
  };
  images?: Array<{ url: string; alt?: string; isMain?: boolean } | string>;
  image?: string;
  status?: string;
  mapPosition?: MapPosition | null;
};

// إصلاح أيقونات العلامة الافتراضية مع Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString()
});

const DEFAULT_CENTER: LatLng = { lat: 24.7136, lng: 46.6753 };

function MapController({
  points,
  selectedPoint,
  selectedId,
  fitAllKey
}: {
  points: LatLng[];
  selectedPoint: LatLng | null;
  selectedId: string;
  fitAllKey: number;
}) {
  const map = useMap();
  const didInitialFit = useRef(false);
  const initialSelectionCaptured = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    didInitialFit.current = false;
    initialSelectionCaptured.current = false;
  }, [fitAllKey]);

  useEffect(() => {
    if (points.length === 0) return;
    if (didInitialFit.current) return;
    didInitialFit.current = true;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 12 });
  }, [map, points, fitAllKey]);

  useEffect(() => {
    if (!selectedPoint || !selectedId) return;
    if (!initialSelectionCaptured.current) {
      initialSelectionCaptured.current = true;
      return;
    }
    map.flyTo([selectedPoint.lat, selectedPoint.lng], points.length <= 1 ? 13 : 14, { duration: 0.55 });
  }, [map, selectedId, selectedPoint, points.length]);

  return null;
}

const BranchesMapSection = () => {
  const [branches, setBranches] = useState<HotelBranch[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [missingMapCount, setMissingMapCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const res = await api.getHotels({ status: 'active', forMap: '1' });
        if (!isMounted) return;

        if (!res.success) {
          setLoadError(res.message || 'تعذّر تحميل الفروع');
          setBranches([]);
          return;
        }

        const all = Array.isArray(res.data?.hotels) ? res.data.hotels : [];
        const withMapData = all.filter((h: HotelBranch) => hotelHasMapLocation(h));

        setBranches(withMapData);
        setMissingMapCount(Math.max(0, all.length - withMapData.length));
        setSelectedId(withMapData[0]?._id || '');
      } catch {
        if (isMounted) {
          setLoadError('تعذّر تحميل خريطة الفروع');
          setBranches([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedBranch = useMemo(
    () => branches.find((b) => b._id === selectedId) || branches[0],
    [branches, selectedId]
  );

  const points = useMemo(() => {
    const raw = branches
      .map((b) => {
        const base = getHotelMapLatLng(b);
        return base ? { branch: b, base } : null;
      })
      .filter(Boolean) as Array<{ branch: HotelBranch; base: MapPosition }>;

    const groups = new Map<string, Array<{ branch: HotelBranch; base: MapPosition }>>();
    raw.forEach((item) => {
      const key = `${item.base.lat.toFixed(3)},${item.base.lng.toFixed(3)}`;
      const list = groups.get(key) || [];
      list.push(item);
      groups.set(key, list);
    });

    return raw.map((item) => {
      const key = `${item.base.lat.toFixed(3)},${item.base.lng.toFixed(3)}`;
      const group = groups.get(key) || [item];
      const index = group.findIndex((g) => g.branch._id === item.branch._id);
      const point = spreadOverlappingPosition(item.base, index, group.length);
      return { branch: item.branch, point, approximate: !!item.base.approximate };
    });
  }, [branches]);

  const selectedPoint = useMemo(() => {
    return points.find((p) => p.branch._id === selectedId)?.point ?? points[0]?.point ?? null;
  }, [points, selectedId]);

  const mapCenter = useMemo(() => {
    if (selectedPoint) return selectedPoint;
    if (points[0]) return points[0].point;
    return DEFAULT_CENTER;
  }, [selectedPoint, points]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          جاري تحميل خريطة الفروع...
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-red-600">
          {loadError}
        </div>
      </section>
    );
  }

  if (branches.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">فروعنا على الخريطة</h2>
          <p className="text-gray-600">
            أي فندق أو منتجع نشط يُضاف له رابط Google Maps أو مدينة واضحة يظهر هنا تلقائياً
          </p>
          {missingMapCount > 0 && (
            <p className="text-sm text-amber-700 mt-2">
              {missingMapCount} فرع نشط بدون موقع على الخريطة — أضف رابط Google Maps من لوحة التحكم
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-50 rounded-2xl border border-gray-200 p-4 max-h-[520px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">قائمة الفروع ({branches.length})</h3>
            <div className="space-y-2">
              {branches.map((branch) => {
                const isSelected = selectedBranch?._id === branch._id;
                return (
                  <button
                    key={branch._id}
                    type="button"
                    onClick={() => setSelectedId(branch._id)}
                    className={`w-full text-right p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-gold/10 border-gold text-gray-900'
                        : 'bg-white border-gray-200 hover:border-gold/50'
                    }`}
                  >
                    <div className="font-semibold">{branch.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {branch.type === 'hotel' ? 'فندق' : 'منتجع'} —{' '}
                      {branch.address?.city || branch.location || 'بدون مدينة'}
                      {branch.mapPosition?.approximate && (
                        <span className="text-amber-600 mr-1"> (موقع تقريبي)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedBranch?.name}</h3>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 ml-1 text-gold shrink-0" />
                    <span>{selectedBranch?.location || selectedBranch?.address?.city || 'الموقع'}</span>
                  </div>
                </div>
                {selectedBranch?.contact?.mapsUrl && (
                  <a
                    href={selectedBranch.contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm bg-gold text-white px-3 py-2 rounded-lg hover:opacity-90"
                  >
                    <Navigation className="w-4 h-4" />
                    فتح في Google Maps
                  </a>
                )}
              </div>

              <div className="w-full h-[450px] z-0" dir="ltr">
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={points.length <= 1 ? 13 : 6}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController
                    points={points.map((x) => x.point)}
                    selectedPoint={selectedPoint}
                    selectedId={selectedId}
                    fitAllKey={branches.length}
                  />
                  {points.map(({ branch, point }) => {
                    // resolve image
                    const rawImgs = Array.isArray(branch.images) ? branch.images : [];
                    const firstImg: any = rawImgs[0];
                    const imgSrc = firstImg
                      ? (typeof firstImg === 'string' ? firstImg : firstImg?.url)
                      : branch.image || '';
                    const typeLabel = branch.type === 'hotel' ? 'فندق' : 'منتجع';
                    const targetUrl = branch.type === 'hotel'
                      ? `/hotel/${branch._id}`
                      : `/resort/${branch._id}`;
                    const cityLabel = branch.address?.city || branch.location || '';

                    return (
                      <Marker
                        key={branch._id}
                        position={[point.lat, point.lng]}
                        eventHandlers={{
                          click: () => setSelectedId(branch._id)
                        }}
                      >
                        <Tooltip
                          permanent
                          direction="top"
                          offset={[0, -2]}
                          opacity={1}
                          className="branch-card-tooltip"
                        >
                          <div
                            style={{
                              fontFamily: 'inherit',
                              direction: 'rtl',
                              width: 130,
                              background: '#fff',
                              borderRadius: 14,
                              overflow: 'hidden',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              border: '1px solid #f0ebe0',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                            onClick={() => setSelectedId(branch._id)}
                          >
                            {/* Image */}
                            <div style={{ position: 'relative', width: '100%', height: 65, overflow: 'hidden', borderRadius: '13px 13px 0 0' }}>
                              {imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={branch.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #c9a55a22, #f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <MapPin style={{ color: '#c9a55a', width: 20, height: 20 }} />
                                </div>
                              )}
                              {/* Type badge */}
                              <div style={{
                                position: 'absolute', top: 4, right: 4,
                                background: '#c9a55a', color: '#fff',
                                borderRadius: 30, padding: '2px 6px',
                                fontSize: 9, fontWeight: 700,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                              }}>
                                {typeLabel}
                              </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <div style={{ fontWeight: 800, fontSize: 11, color: '#c9a55a', lineHeight: 1.2 }}>
                                {branch.name}
                              </div>
                              {cityLabel && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#b89650', fontSize: 9, fontWeight: 500 }}>
                                  <MapPin style={{ width: 9, height: 9, color: '#e53935', flexShrink: 0 }} />
                                  <span>{cityLabel}</span>
                                </div>
                              )}

                              {/* Buttons row */}
                              <div style={{ display: 'flex', gap: 3, marginTop: 3, alignItems: 'center' }}>
                                <Link
                                  to={targetUrl}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    flex: 1,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    background: '#000', color: '#fff',
                                    borderRadius: 30,
                                    padding: '4px 6px',
                                    fontSize: 9, fontWeight: 700,
                                    textDecoration: 'none',
                                    letterSpacing: '0.02em',
                                  }}
                                >
                                  BOOK NOW
                                </Link>
                                {branch.contact?.mapsUrl && (
                                  <a
                                    href={branch.contact.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      width: 22, height: 22,
                                      background: '#f5efe0',
                                      borderRadius: '50%',
                                      flexShrink: 0,
                                      border: '1px solid #c9a55a',
                                      color: '#c9a55a',
                                      textDecoration: 'none',
                                    }}
                                    title="فتح في Google Maps"
                                  >
                                    <Navigation style={{ width: 9, height: 9 }} />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </Tooltip>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BranchesMapSection;
