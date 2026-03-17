import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { siteAPI } from '../api/services';
import { useToast } from '../context/ToastContext';

const colorByHealth = {
  green: '#16a34a',
  yellow: '#eab308',
  red: '#ef4444'
};

const loadLeaflet = async () => {
  if (window.L) return window.L;

  await new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve;
    document.body.appendChild(script);
  });

  return window.L;
};

const NetworkMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendor, setVendor] = useState('');
  const { pushToast } = useToast();

  const vendors = useMemo(() => [...new Set(sites.map((site) => site.vendor))].sort(), [sites]);

  const fetchData = async (selectedVendor = '') => {
    setLoading(true);
    setError('');
    try {
      const { data } = await siteAPI.getMapView({ vendor: selectedVendor || undefined });
      setSites(data.data.sites || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load map data');
      pushToast('Unable to load map data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;
      const L = await loadLeaflet();

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([39.5, -98.35], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);
        markerLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      }

      markerLayerRef.current.clearLayers();

      sites.forEach((site) => {
        const marker = L.circleMarker([site.location.lat, site.location.lng], {
          color: colorByHealth[site.health] || '#64748b',
          radius: 8,
          fillOpacity: 0.9
        }).addTo(markerLayerRef.current);

        marker.bindPopup(`
          <div style="min-width: 220px;">
            <strong>${site.siteId}</strong><br/>
            ${site.location.address}<br/>
            Vendor: ${site.vendor}<br/>
            Install: ${site.installationStatus}<br/>
            Commissioning: ${site.commissioningStatus}<br/>
            Active alarms: ${site.activeAlarms}
          </div>
        `);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [sites]);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Network Map</h1>

      <Card className="mb-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="w-full md:w-64">
            <label className="text-sm text-gray-600 dark:text-gray-300">Vendor Filter</label>
            <select className="w-full mt-2 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={vendor} onChange={(e) => setVendor(e.target.value)}>
              <option value="">All Vendors</option>
              {vendors.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <Button onClick={() => fetchData(vendor)}>Apply</Button>
          <Button variant="secondary" onClick={() => { setVendor(''); fetchData(''); }}>Reset</Button>
        </div>

        <div className="flex gap-4 mt-4 text-sm">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600" />Healthy</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" />Major alarms</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" />Critical alarms</span>
        </div>
      </Card>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Card>
        <div ref={mapRef} className="h-[65vh] w-full rounded-lg overflow-hidden" />
      </Card>
    </div>
  );
};

export default NetworkMap;
