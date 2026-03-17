import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import StatCard from '../components/dashboard/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { dashboardAPI, alarmAPI } from '../api/services';
import { useSocket } from '../context/SocketContext';
import { formatDate } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentAlarms, setRecentAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, chartsRes, alarmsRes] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getChartData(),
        alarmAPI.getAll({ limit: 5, sort: '-raisedAt' })
      ]);

      setMetrics(metricsRes.data.data);
      setChartData(chartsRes.data.data);
      setRecentAlarms(alarmsRes.data.data.alarms || []);
    } catch (error) {
      pushToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => fetchDashboardData();
    const onEscalated = () => pushToast('Alarm escalated due to SLA breach', 'warning');

    socket.on('alarm:new', refresh);
    socket.on('alarm:updated', refresh);
    socket.on('alarm:escalated', onEscalated);

    return () => {
      socket.off('alarm:new', refresh);
      socket.off('alarm:updated', refresh);
      socket.off('alarm:escalated', onEscalated);
    };
  }, [socket]);

  const severityPie = useMemo(() => ({
    labels: chartData?.severityDistribution?.map((item) => item._id) || [],
    datasets: [{
      data: chartData?.severityDistribution?.map((item) => item.count) || [],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
    }]
  }), [chartData]);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <button className="text-left" onClick={() => navigate('/sites')}>
          <StatCard title="Total Sites" value={metrics?.totalSites || 0} icon={Radio} color="blue" />
        </button>
        <button className="text-left" onClick={() => navigate('/sites?status=Commissioned')}>
          <StatCard title="Commissioned Sites" value={metrics?.commissionedSites || 0} icon={CheckCircle} color="green" />
        </button>
        <button className="text-left" onClick={() => navigate('/alarms?status=Open')}>
          <StatCard title="Active Alarms" value={metrics?.activeAlarms || 0} icon={AlertTriangle} color="yellow" />
        </button>
        <button className="text-left" onClick={() => navigate('/alarms?severity=Critical')}>
          <StatCard title="Critical Alarms" value={metrics?.criticalAlarms || 0} icon={AlertTriangle} color="red" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Performance Metrics" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average MTTR</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics?.avgMTTR || 0} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">SLA Compliance</span>
              <span className="text-2xl font-bold text-green-600">{metrics?.slaCompliance || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="text-2xl font-bold text-blue-600">{metrics?.completionRate || 0}%</span>
            </div>
            <Button className="w-full mt-2" onClick={() => navigate('/reports')}>Open Full Reports</Button>
          </div>
        </Card>

        <Card title="Alarm Severity Snapshot" className="lg:col-span-1">
          <Pie data={severityPie} />
          <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/alarms')}>Go To Alarms</Button>
        </Card>

        <Card title="Recent Alarms" className="lg:col-span-1">
          <div className="space-y-3">
            {recentAlarms.map((alarm) => (
              <div key={alarm._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">{alarm.alarmType}</p>
                  <span className="text-xs text-gray-500">{alarm.severity}</span>
                </div>
                <p className="text-xs text-gray-500">{alarm.siteId} • {formatDate(alarm.raisedAt)}</p>
              </div>
            ))}
            {recentAlarms.length === 0 && <p className="text-sm text-gray-500">No alarms yet</p>}
          </div>

          <button
            className="mt-4 text-sm text-primary inline-flex items-center gap-1"
            onClick={() => navigate('/alarms')}
          >
            View all alarms <ArrowRight size={14} />
          </button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
