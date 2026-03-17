import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { reportAPI, siteAPI } from '../api/services';
import { useToast } from '../context/ToastContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const Reports = () => {
  const [filters, setFilters] = useState({ from: '', to: '', vendor: '' });
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { pushToast } = useToast();

  useEffect(() => {
    setFilters({
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      vendor: searchParams.get('vendor') || ''
    });
  }, []);

  const loadVendors = async () => {
    try {
      const { data } = await siteAPI.getAll({ page: 1, limit: 500 });
      const uniqueVendors = [...new Set((data.data.sites || []).map((site) => site.vendor))];
      setVendors(uniqueVendors.sort());
    } catch (err) {
      console.error(err);
    }
  };

  const loadKpis = async () => {
    setLoading(true);
    setError('');
    try {
      const query = {
        from: filters.from || undefined,
        to: filters.to || undefined,
        vendor: filters.vendor || undefined
      };
      const { data } = await reportAPI.getKpis(query);
      setKpis(data.data);
      setSearchParams({
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.vendor ? { vendor: filters.vendor } : {})
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    loadKpis();
  }, [filters.from, filters.to, filters.vendor]);

  const lineData = useMemo(() => ({
    labels: kpis?.mttrTrend?.map((item) => item.date) || [],
    datasets: [{
      label: 'MTTR (min)',
      data: kpis?.mttrTrend?.map((item) => item.mttr) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.2)',
      tension: 0.3
    }]
  }), [kpis]);

  const pieData = useMemo(() => ({
    labels: kpis?.alarmBySeverity?.map((item) => item.severity) || [],
    datasets: [{
      data: kpis?.alarmBySeverity?.map((item) => item.count) || [],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
    }]
  }), [kpis]);

  const siteRolloutData = useMemo(() => ({
    labels: kpis?.siteRolloutProgress?.map((item) => item.status) || [],
    datasets: [{
      data: kpis?.siteRolloutProgress?.map((item) => item.count) || [],
      backgroundColor: ['#94a3b8', '#60a5fa', '#22c55e', '#16a34a', '#06b6d4']
    }]
  }), [kpis]);

  const download = async (type) => {
    try {
      const query = {
        from: filters.from || undefined,
        to: filters.to || undefined,
        vendor: filters.vendor || undefined
      };
      const response = type === 'csv' ? await reportAPI.exportCsv(query) : await reportAPI.exportPdf(query);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `telecom-noc-report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      pushToast(`Report exported as ${type.toUpperCase()}`, 'success');
    } catch (err) {
      pushToast('Export failed', 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Reports & Analytics</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
          <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Vendor</label>
            <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" value={filters.vendor} onChange={(e) => setFilters((p) => ({ ...p, vendor: e.target.value }))}>
              <option value="">All Vendors</option>
              {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-end"><Button onClick={loadKpis}>Apply</Button></div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={() => download('csv')}>Export CSV</Button>
          <Button variant="secondary" onClick={() => download('pdf')}>Export PDF</Button>
        </div>
      </Card>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="MTTR Trend"><Line data={lineData} /></Card>
        <Card title="Alarm Severity Distribution"><Pie data={pieData} /></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="Site Rollout Progress"><Pie data={siteRolloutData} /></Card>
        {kpis && (
          <Card title="SLA Summary">
            <p>SLA Compliance: <strong>{kpis.slaCompliance.compliancePercent}%</strong></p>
            <p>Total Alarms: {kpis.slaCompliance.total}</p>
            <p>Breached: {kpis.slaCompliance.breached}</p>
            <p>Compliant: {kpis.slaCompliance.compliant}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
