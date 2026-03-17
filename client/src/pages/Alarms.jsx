import { useEffect, useMemo, useState } from 'react';
import { Plus, Bell, Play, X, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import Input from '../components/common/Input';
import { alarmAPI, siteAPI } from '../api/services';
import { formatDate } from '../utils/helpers';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const createInitial = {
  siteId: '',
  alarmType: '',
  severity: 'Major',
  description: '',
  slaThreshold: ''
};

const Alarms = () => {
  const [alarms, setAlarms] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSite, setSelectedSite] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState(createInitial);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const { socket, connected } = useSocket();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const canManage = ['Admin', 'NOC Engineer'].includes(user?.role);

  useEffect(() => {
    const initialSeverity = searchParams.get('severity') || 'all';
    const initialStatus = searchParams.get('status') || 'all';
    const initialSite = searchParams.get('siteId') || '';
    setSeverityFilter(initialSeverity);
    setStatusFilter(initialStatus);
    setSelectedSite(initialSite);
  }, []);

  const fetchAlarms = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = {
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        siteId: selectedSite || undefined,
        limit: 100
      };
      const { data } = await alarmAPI.getAll(params);
      setAlarms(data.data.alarms || []);
    } catch (error) {
      setFetchError(error?.response?.data?.message || 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await siteAPI.getAll({ limit: 500, sort: 'siteId' });
        setSites(data.data.sites || []);
      } catch (error) {
        console.error(error);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    fetchAlarms();
  }, [severityFilter, statusFilter, selectedSite]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (alarm) => setAlarms((prev) => [alarm, ...prev]);
    const onUpdated = (updatedAlarm) => {
      setAlarms((prev) => prev.map((alarm) => (alarm._id === updatedAlarm._id ? updatedAlarm : alarm)));
    };
    const onEscalated = (event) => {
      setNotification(`Alarm ${event.alarmId} escalated (SLA breach)`);
      pushToast(`Alarm escalated for site ${event.siteId}`, 'warning');
    };
    const onCritical = (event) => {
      setNotification(`Critical alarm on ${event.siteId}: ${event.alarmType}`);
      pushToast(`Critical alarm on ${event.siteId}`, 'error');
    };

    socket.on('alarm:new', onNew);
    socket.on('alarm:updated', onUpdated);
    socket.on('alarm:escalated', onEscalated);
    socket.on('alarm:critical-notification', onCritical);

    return () => {
      socket.off('alarm:new', onNew);
      socket.off('alarm:updated', onUpdated);
      socket.off('alarm:escalated', onEscalated);
      socket.off('alarm:critical-notification', onCritical);
    };
  }, [socket]);

  const simulate = async () => {
    setSimulating(true);
    try {
      await alarmAPI.simulate(5);
      pushToast('Simulated 5 alarms', 'success');
      await fetchAlarms();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Simulation failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const createAlarm = async (e) => {
    e.preventDefault();
    if (!createData.siteId || !createData.alarmType || !createData.description) {
      pushToast('Fill all required alarm fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      await alarmAPI.create({
        ...createData,
        slaThreshold: createData.slaThreshold ? Number(createData.slaThreshold) : undefined
      });
      setShowCreate(false);
      setCreateData(createInitial);
      pushToast('Alarm created', 'success');
      await fetchAlarms();
    } catch (error) {
      setFetchError(error?.response?.data?.message || 'Failed to create alarm');
    } finally {
      setSaving(false);
    }
  };

  const quickUpdateStatus = async (alarmId, status) => {
    try {
      await alarmAPI.update(alarmId, { status });
      pushToast(`Alarm moved to ${status}`, 'success');
      await fetchAlarms();
    } catch (error) {
      setFetchError(error?.response?.data?.message || 'Failed to update alarm status');
    }
  };

  const deleteAlarm = async (alarmId) => {
    const ok = window.confirm('Delete this alarm?');
    if (!ok) return;

    try {
      await alarmAPI.delete(alarmId);
      pushToast('Alarm deleted', 'success');
      await fetchAlarms();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Failed to delete alarm', 'error');
    }
  };

  const applyFilters = () => {
    setSearchParams({
      ...(severityFilter !== 'all' ? { severity: severityFilter } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(selectedSite ? { siteId: selectedSite } : {})
    });
    fetchAlarms();
  };

  const severityOptions = useMemo(() => ['all', 'Critical', 'Major', 'Minor'], []);

  if (loading) return <Loading />;

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Alarms</h1>
            {connected && (
              <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Bell size={16} className="animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={simulate} disabled={simulating}>
              <Play size={16} className="mr-2" />
              {simulating ? 'Simulating...' : 'Simulate Alarms'}
            </Button>
            {canManage && (
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={20} className="mr-2" />
                Create Alarm
              </Button>
            )}
          </div>
        </div>

        {notification && (
          <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 flex justify-between items-center">
            <span>{notification}</span>
            <button onClick={() => setNotification('')}><X size={16} /></button>
          </div>
        )}

        {fetchError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{fetchError}</p>}

        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              {severityOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">all</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
              <option value="">All Sites</option>
              {sites.map((site) => <option key={site._id} value={site.siteId}>{site.siteId}</option>)}
            </select>
            <Button onClick={applyFilters}>Apply</Button>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            {alarms.map((alarm) => (
              <div key={alarm._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{alarm.alarmType}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Site: {alarm.siteId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge type="severity">{alarm.severity}</Badge>
                    <Badge type="status">{alarm.status}</Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alarm.description}</p>
                <p className="text-xs text-gray-500 mb-2">Raised: {formatDate(alarm.raisedAt)}</p>
                {alarm.slaBreached && <p className="text-xs text-red-500 mb-2">SLA breached</p>}

                <div className="flex gap-2">
                  {alarm.status !== 'In Progress' && canManage && (
                    <Button size="sm" variant="secondary" onClick={() => quickUpdateStatus(alarm._id, 'In Progress')}>Set In Progress</Button>
                  )}
                  {alarm.status !== 'Resolved' && canManage && (
                    <Button size="sm" variant="success" onClick={() => quickUpdateStatus(alarm._id, 'Resolved')}>Resolve</Button>
                  )}
                  {canManage && (
                    <Button size="sm" variant="danger" onClick={() => deleteAlarm(alarm._id)}><Trash2 size={14} /></Button>
                  )}
                </div>
              </div>
            ))}

            {alarms.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No alarms found</p>}
          </div>
        </Card>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Alarm</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-600 dark:text-gray-300"><X size={20} /></button>
            </div>

            <form onSubmit={createAlarm}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Site</label>
                <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" value={createData.siteId} onChange={(e) => setCreateData((prev) => ({ ...prev, siteId: e.target.value }))} required>
                  <option value="">Choose site</option>
                  {sites.map((site) => <option key={site._id} value={site.siteId}>{site.siteId}</option>)}
                </select>
              </div>

              <Input label="Alarm Type" value={createData.alarmType} onChange={(e) => setCreateData((prev) => ({ ...prev, alarmType: e.target.value }))} required />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Severity</label>
                <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" value={createData.severity} onChange={(e) => setCreateData((prev) => ({ ...prev, severity: e.target.value }))}>
                  <option>Critical</option>
                  <option>Major</option>
                  <option>Minor</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea rows={3} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" value={createData.description} onChange={(e) => setCreateData((prev) => ({ ...prev, description: e.target.value }))} required />
              </div>

              <Input label="SLA Threshold (minutes, optional)" type="number" value={createData.slaThreshold} onChange={(e) => setCreateData((prev) => ({ ...prev, slaThreshold: e.target.value }))} />

              <div className="flex justify-end gap-3 mt-2">
                <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Alarm'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Alarms;
