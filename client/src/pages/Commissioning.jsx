import { useEffect, useMemo, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Badge from '../components/common/Badge';
import { commissioningAPI, siteAPI } from '../api/services';
import { formatDate } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

const Commissioning = () => {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState('');
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState('');
  const { pushToast } = useToast();

  const selectedSite = useMemo(() => sites.find((site) => site.siteId === selectedSiteId), [sites, selectedSiteId]);

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

  const loadCommissioning = async (siteId) => {
    if (!siteId) return;

    setLoading(true);
    setError('');
    setRecord(null);

    try {
      const { data } = await commissioningAPI.getBySite(siteId);
      setRecord(data.data.commissioning);
      const nextRemarks = {};
      data.data.commissioning.checklist.forEach((item) => {
        nextRemarks[item._id] = item.remarks || '';
      });
      setRemarks(nextRemarks);
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          const { data } = await commissioningAPI.create({ siteId });
          setRecord(data.data.commissioning);
          const nextRemarks = {};
          data.data.commissioning.checklist.forEach((item) => {
            nextRemarks[item._id] = item.remarks || '';
          });
          setRemarks(nextRemarks);
          pushToast(`Commissioning initialized for ${siteId}`, 'success');
        } catch (createErr) {
          setError(createErr?.response?.data?.message || 'Failed to initialize commissioning');
        }
      } else {
        setError(err?.response?.data?.message || 'Failed to load commissioning');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveChecklistItem = async (item, completed) => {
    if (!selectedSiteId) return;
    setSavingItemId(item._id);
    setError('');

    try {
      const { data } = await commissioningAPI.updateChecklistItem(selectedSiteId, item._id, {
        completed,
        remarks: remarks[item._id] || ''
      });
      setRecord(data.data.commissioning);
      pushToast(`${item.label} updated`, 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update checklist item');
    } finally {
      setSavingItemId('');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Commissioning</h1>

      <Card className="mb-6">
        <label className="text-sm text-gray-600 dark:text-gray-300">Select Site</label>
        <select
          className="w-full mt-2 px-3 py-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          value={selectedSiteId}
          onChange={(e) => {
            setSelectedSiteId(e.target.value);
            loadCommissioning(e.target.value);
          }}
        >
          <option value="">Choose site</option>
          {sites.map((site) => (
            <option key={site._id} value={site.siteId}>{site.siteId} - {site.location.address}</option>
          ))}
        </select>

        {selectedSite && (
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Vendor: {selectedSite.vendor} | Install status: {selectedSite.installationStatus}
          </div>
        )}
      </Card>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {record && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Engineer: {record.engineerName}</p>
              <p className="text-sm text-gray-500">Progress: {record.progress}%</p>
            </div>
            <Badge type="status">{record.status}</Badge>
          </div>

          <div className="space-y-4">
            {record.checklist.map((item) => (
              <div key={item._id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                    {item.completedAt && (
                      <p className="text-xs text-gray-500">
                        Completed by {item.completedByName} on {formatDate(item.completedAt)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={item.completed ? 'success' : 'primary'}
                    disabled={savingItemId === item._id}
                    onClick={() => saveChecklistItem(item, !item.completed)}
                  >
                    {savingItemId === item._id ? 'Saving...' : item.completed ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>

                <textarea
                  className="w-full mt-3 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  rows={2}
                  placeholder="Remarks"
                  value={remarks[item._id] || ''}
                  onChange={(e) => setRemarks((prev) => ({ ...prev, [item._id]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {record.isCommissioned && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">
              Site auto-commissioned at {formatDate(record.commissionedAt)}.
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Commissioning;
