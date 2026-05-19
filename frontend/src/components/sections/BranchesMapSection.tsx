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
  const [selectedCity, setSelectedCity] = useState<string>('الكل');

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

  // Compute unique cities from branches
  const cities = useMemo(() => {
    const list = new Set<string>();
    branches.forEach((b) => {
      const city = b.address?.city || b.location;
      if (city) {
        list.add(city.trim());
      }
    });
    return ['الكل', ...Array.from(list)];
  }, [branches]);

  // Filter branches based on selected city tab
  const filteredBranches = useMemo(() => {
    if (selectedCity === 'الكل') return branches;
    return branches.filter((b) => {
      const city = b.address?.city || b.location;
      return city?.trim() === selectedCity;
    });
  }, [branches, selectedCity]);

  const selectedBranch = useMemo(
    () => filteredBranches.find((b) => b._id === selectedId) || filteredBranches[0] || branches[0],
    [filteredBranches, branches, selectedId]
  );

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const targetBranches = city === 'الكل' 
      ? branches 
      : branches.filter(b => (b.address?.city || b.location || '').trim() === city);
    if (targetBranches.length > 0) {
      setSelectedId(targetBranches[0]._id);
    }
  };

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

  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (selectedCity === 'الكل') return true;
      const city = p.branch.address?.city || p.branch.location;
      return city?.trim() === selectedCity;
    });
  }, [points, selectedCity]);

  const mapCenter = useMemo(() => {
    if (selectedPoint) return selectedPoint;
    if (points[0]) return points[0].point;
    return DEFAULT_CENTER;
  }, [selectedPoint, points]);

  if (loading) {
    return (
      <section className="py-8 md:py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          جاري تحميل خريطة الفروع...
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="py-8 md:py-16 bg-transparent">
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
    <section className="py-8 md:py-16 bg-transparent" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">فروعنا على الخريطة</h2>
          {/* <p className="text-gray-600">
            أي فندق أو منتجع نشط يُضاف له رابط Google Maps أو مدينة واضحة يظهر هنا تلقائياً
          </p> */}
          {missingMapCount > 0 && (
            <p className="text-sm text-amber-700 mt-2">
              {missingMapCount} فرع نشط بدون موقع على الخريطة — أضف رابط Google Maps من لوحة التحكم
            </p>
          )}
        </div>

        {/* Dynamic City Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-10" dir="rtl">
          {cities.map((city) => {
            const isActive = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => handleCityChange(city)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shadow-sm border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] border-[#c9a55a] text-white shadow-md scale-105'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#c9a55a] hover:text-[#c9a55a] hover:bg-gray-50'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch List Column */}
          <div className="lg:col-span-1 bg-gray-50/50 rounded-3xl border border-gray-200/80 p-4 max-h-[520px] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 px-1 flex items-center justify-between">
              <span>قائمة الفروع ({filteredBranches.length})</span>
              {selectedCity !== 'الكل' && (
                <span className="text-xs bg-[#c9a55a]/10 text-[#c9a55a] px-2 py-0.5 rounded-full">
                  مدينة {selectedCity}
                </span>
              )}
            </h3>
            
            <div className="space-y-3">
              {filteredBranches.map((branch) => {
                const isSelected = selectedBranch?._id === branch._id;
                
                // resolve image
                const rawImgs = Array.isArray(branch.images) ? branch.images : [];
                const firstImg: any = rawImgs[0];
                const imgSrc = firstImg
                  ? (typeof firstImg === 'string' ? firstImg : firstImg?.url)
                  : branch.image || '';
                
                const cityLabel = branch.address?.city || branch.location || 'بدون مدينة';
                
                return (
                  <button
                    key={branch._id}
                    type="button"
                    onClick={() => setSelectedId(branch._id)}
                    className={`w-full text-right p-3 rounded-2xl border transition duration-300 flex items-center gap-3.5 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#c9a55a]/12 to-[#c9a55a]/4 border-[#c9a55a] text-gray-900 shadow-md'
                        : 'bg-white border-gray-150 hover:border-[#c9a55a]/50 text-gray-700 shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Glowing golden side indicator */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-[#c9a55a] rounded-l" />
                    )}

                    {/* Image thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-inner relative">
                      {imgSrc ? (
                        <img src={imgSrc} alt={branch.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#c9a55a]/10 to-[#c9a55a]/20 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#c9a55a]/70" />
                        </div>
                      )}
                    </div>

                    {/* Card details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          branch.type === 'hotel' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {branch.type === 'hotel' ? 'فندق' : 'منتجع'}
                        </span>
                        
                        {/* 5 Golden Stars rating */}
                        <div className="flex items-center text-amber-400 text-[10px]">
                          ★ ★ ★ ★ ★
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-[14px] text-gray-900 truncate leading-snug group-hover:text-[#c9a55a] transition-colors">
                        {branch.name}
                      </h4>
                      
                      <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3 h-3 text-[#e53935] shrink-0" />
                        <span>{cityLabel}</span>
                        {branch.mapPosition?.approximate && (
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded shrink-0">موقع تقريبي</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-md">
              {/* Map header with selected branch details */}
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{selectedBranch?.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedBranch?.type === 'hotel' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {selectedBranch?.type === 'hotel' ? 'فندق' : 'منتجع'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center mt-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 ml-1 text-[#e53935] shrink-0" />
                    <span>{selectedBranch?.location || selectedBranch?.address?.city || 'الموقع'}</span>
                  </div>
                </div>
                
                {selectedBranch?.contact?.mapsUrl && (
                  <a
                    href={selectedBranch.contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs md:text-sm bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white px-4 py-2.5 rounded-full hover:brightness-105 transition shadow-sm font-bold"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    فتح في Google Maps
                  </a>
                )}
              </div>

              {/* Leaflet Map container */}
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
                    points={filteredPoints.map((x) => x.point)}
                    selectedPoint={selectedPoint}
                    selectedId={selectedId}
                    fitAllKey={filteredBranches.length}
                  />
                  {points.map(({ branch, point }) => {
                    // resolve image
                    const rawImgs = Array.isArray(branch.images) ? branch.images : [];
                    const firstImg: any = rawImgs[0];
                    const imgSrc = firstImg
                      ? (typeof firstImg === 'string' ? firstImg : firstImg?.url)
                      : branch.image || '';
                    const isSelected = selectedId === branch._id;

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
                              background: isSelected 
                                ? 'linear-gradient(135deg, #DfB86c 0%, #c9a55a 100%)' 
                                : '#ffffff',
                              color: isSelected ? '#ffffff' : '#1f2937',
                              borderRadius: '30px',
                              boxShadow: isSelected 
                                ? '0 6px 15px rgba(201, 165, 90, 0.4)' 
                                : '0 4px 10px rgba(0, 0, 0, 0.08)',
                              border: isSelected 
                                ? '1.5px solid #c9a55a' 
                                : '1.5px solid rgba(201, 165, 90, 0.3)',
                              padding: '4px 6px 4px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            }}
                            onClick={() => setSelectedId(branch._id)}
                          >
                            {/* الصورة المصغرة كأيقونة دائرية */}
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(201,165,90,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: isSelected ? '1px solid #ffffff' : '1px solid rgba(201,165,90,0.3)'
                            }}>
                              {imgSrc ? (
                                <img 
                                  src={imgSrc} 
                                  alt={branch.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <MapPin style={{ 
                                  width: '14px', 
                                  height: '14px', 
                                  color: isSelected ? '#ffffff' : '#c9a55a' 
                                }} />
                              )}
                            </div>
                            
                            {/* اسم الفرع */}
                            <span style={{ 
                              fontWeight: 800, 
                              fontSize: '12px',
                              letterSpacing: '0.01em'
                            }}>
                              {branch.name}
                            </span>
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
