import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { configurationAPI, siteAPI } from '../api/services';
import { formatDate } from '../utils/helpers';

const initialParams = {
  ipAddress: '',
  vlan: '',
  frequency: '',
  pci: '',
  softwareVersion: ''
};

const Configuration = () => {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [params, setParams] = useState(initialParams);
  const [changeReason, setChangeReason] = useState('Manual update');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState(null);
  const [versionA, setVersionA] = useState('');
  const [versionB, setVersionB] = useState('');
  const { pushToast } = useToast();

  const versionList = useMemo(() => history.map((item) => item.version), [history]);

  useEffect(() => {
    const loadSites = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await siteAPI.getAll({ limit: 500, sort: 'siteId' });
        setSites(data.data.sites || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load sites');
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, []);

  const loadHistory = async (siteId) => {
    if (!siteId) return;

    setLoading(true);
    setError('');
    setComparison(null);

    try {
      const [historyRes, latestRes] = await Promise.all([
        configurationAPI.getHistory(siteId, { page: 1, limit: 100 }),
        configurationAPI.getLatest(siteId).catch(() => null)
      ]);

      const nextHistory = historyRes.data.data.configurations || [];
      setHistory(nextHistory);

      if (latestRes?.data?.data?.configuration?.parameters) {
        setParams(latestRes.data.data.configuration.parameters);
      } else {
        setParams(initialParams);
      }

      if (nextHistory.length >= 2) {
        setVersionA(String(nextHistory[1].version));
        setVersionB(String(nextHistory[0].version));
      } else {
        setVersionA('');
        setVersionB('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load configuration history');
    } finally {
      setLoading(false);
    }
  };

  const validateParams = () => {
    if (!params.ipAddress || !params.vlan || !params.frequency || !params.pci || !params.softwareVersion) {
      return 'All configuration fields are required';
    }
    return '';
  };

  const submitConfiguration = async () => {
    if (!selectedSiteId) {
      setError('Select a site first');
      return;
    }

    const validationError = validateParams();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await configurationAPI.create({ siteId: selectedSiteId, parameters: params, changeReason });
      pushToast('Configuration version created', 'success');
      await loadHistory(selectedSiteId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create configuration version');
    } finally {
      setSaving(false);
    }
  };

  const compareVersions = async () => {
    if (!selectedSiteId || !versionA || !versionB) {
      setError('Select both versions to compare');
      return;
    }

    setError('');
    try {
      const { data } = await configurationAPI.compare(selectedSiteId, Number(versionA), Number(versionB));
      setComparison(data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to compare versions');
    }
  };

  const rollback = async (version) => {
    if (!selectedSiteId) return;
    const ok = window.confirm(`Rollback to version ${version}?`);
    if (!ok) return;

    setError('');
    try {
      await configurationAPI.rollback(selectedSiteId, version);
      pushToast(`Rolled back to v${version}`, 'success');
      await loadHistory(selectedSiteId);
    } catch (err) {
      setError(err?.response?.data?.message || 'Rollback failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Configuration Management</h1>

      <Card className="mb-6">
        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-300">Select Site</label>
          <select className="w-full mt-2 px-3 py-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value={selectedSiteId} onChange={(e) => { setSelectedSiteId(e.target.value); loadHistory(e.target.value); }}>
            <option value="">Choose site</option>
            {sites.map((site) => <option key={site._id} value={site.siteId}>{site.siteId}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="IP Address" value={params.ipAddress} onChange={(e) => setParams((prev) => ({ ...prev, ipAddress: e.target.value }))} />
          <Input label="VLAN" value={params.vlan} onChange={(e) => setParams((prev) => ({ ...prev, vlan: e.target.value }))} />
          <Input label="Frequency" value={params.frequency} onChange={(e) => setParams((prev) => ({ ...prev, frequency: e.target.value }))} />
          <Input label="PCI" value={params.pci} onChange={(e) => setParams((prev) => ({ ...prev, pci: e.target.value }))} />
          <Input label="Software Version" value={params.softwareVersion} onChange={(e) => setParams((prev) => ({ ...prev, softwareVersion: e.target.value }))} />
        </div>

        <Input label="Change Reason" value={changeReason} onChange={(e) => setChangeReason(e.target.value)} />
        <Button onClick={submitConfiguration} disabled={saving}>{saving ? 'Saving...' : 'Create New Version'}</Button>
      </Card>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Card title="Version History" className="mt-6">
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
              <div className="flex justify-between items-center">
                <span className="font-medium">v{item.version} {item.isActive ? '(Active)' : ''}</span>
                <Button size="sm" variant="secondary" disabled={item.isActive} onClick={() => rollback(item.version)}>Rollback</Button>
              </div>
              <p className="text-xs text-gray-500">Updated: {formatDate(item.updatedAt)}</p>
              <p className="text-xs text-gray-500">Reason: {item.changeReason || '-'}</p>
            </div>
          ))}
        </div>

        {versionList.length >= 2 && (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Version A</label>
                <select className="w-full mt-2 px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" value={versionA} onChange={(e) => setVersionA(e.target.value)}>
                  <option value="">Select</option>
                  {versionList.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Version B</label>
                <select className="w-full mt-2 px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" value={versionB} onChange={(e) => setVersionB(e.target.value)}>
                  <option value="">Select</option>
                  {versionList.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex items-end"><Button onClick={compareVersions}>Compare</Button></div>
            </div>

            {comparison && (
              <div className="mt-4 space-y-2">
                {comparison.differences.length === 0 && <p className="text-sm text-gray-500">No differences</p>}
                {comparison.differences.map((diff) => (
                  <p key={diff.field} className="text-sm"><strong>{diff.field}:</strong> {String(diff.oldValue || '-')} to {String(diff.newValue || '-')}</p>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Configuration;
