import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Search, Pencil, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import Input from '../components/common/Input';
import { siteAPI } from '../api/services';
import { formatDate } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  siteId: '',
  address: '',
  lat: '',
  lng: '',
  vendor: 'Nokia',
  installationStatus: 'Planned',
  notes: ''
};

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('');
  const [status, setStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(defaultForm);

  const [searchParams, setSearchParams] = useSearchParams();
  const { pushToast } = useToast();
  const { user } = useAuth();
  const canManage = ['Admin', 'Manager', 'Field Engineer'].includes(user?.role);

  const vendors = useMemo(() => ['Nokia', 'Huawei', 'Ericsson', 'ZTE', 'Samsung'], []);

  useEffect(() => {
    const initialStatus = searchParams.get('status') || '';
    const initialVendor = searchParams.get('vendor') || '';
    const initialSiteId = searchParams.get('siteId') || '';
    setStatus(initialStatus);
    setVendor(initialVendor);
    setSearch(initialSiteId);
  }, []);

  useEffect(() => {
    fetchSites();
  }, [page, vendor, status]);

  const fetchSites = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await siteAPI.getAll({
        page,
        limit: 10,
        vendor: vendor || undefined,
        status: status || undefined,
        siteId: search || undefined
      });
      setSites(data.data.sites || []);
      setTotalPages(data.data.pagination.pages || 1);
    } catch (error) {
      setFetchError(error?.response?.data?.message || 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setFormError('');
    setEditMode(false);
    setEditingSiteId('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (site) => {
    setEditMode(true);
    setEditingSiteId(site.siteId);
    setFormData({
      siteId: site.siteId,
      address: site.location.address,
      lat: String(site.location.lat),
      lng: String(site.location.lng),
      vendor: site.vendor,
      installationStatus: site.installationStatus,
      notes: site.notes || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const { siteId, address, lat, lng } = formData;
    if (!siteId || !address || !lat || !lng) {
      return 'Please fill in all required fields.';
    }
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      return 'Latitude must be between -90 and 90.';
    }
    if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return 'Longitude must be between -180 and 180.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        location: {
          address: formData.address.trim(),
          lat: Number(formData.lat),
          lng: Number(formData.lng)
        },
        vendor: formData.vendor,
        installationStatus: formData.installationStatus,
        notes: formData.notes.trim()
      };

      if (editMode) {
        await siteAPI.update(editingSiteId, payload);
        pushToast(`Site ${editingSiteId} updated`, 'success');
      } else {
        await siteAPI.create({
          siteId: formData.siteId.trim().toUpperCase(),
          ...payload
        });
        pushToast(`Site ${formData.siteId.trim().toUpperCase()} created`, 'success');
      }

      handleClose();
      setPage(1);
      await fetchSites();
    } catch (err) {
      const statusCode = err?.response?.status;
      if (statusCode === 409) {
        setFormError('Site ID already exists. Choose a different Site ID.');
      } else {
        setFormError(err?.response?.data?.message || 'Failed to save site.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (siteId) => {
    const ok = window.confirm(`Delete site ${siteId}? This action cannot be undone.`);
    if (!ok) return;

    try {
      await siteAPI.delete(siteId);
      pushToast(`Site ${siteId} deleted`, 'success');
      await fetchSites();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Failed to delete site', 'error');
    }
  };

  const applyFilters = async () => {
    setPage(1);
    setSearchParams({
      ...(status ? { status } : {}),
      ...(vendor ? { vendor } : {}),
      ...(search ? { siteId: search } : {})
    });
    await fetchSites();
  };

  if (loading) return <Loading />;

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sites</h1>
          {canManage && (
            <Button onClick={openCreate}>
              <Plus size={20} className="mr-2" />
              Add Site
            </Button>
          )}
        </div>

        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="Search by Site ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" value={vendor} onChange={(e) => setVendor(e.target.value)}>
              <option value="">All Vendors</option>
              {vendors.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option>Planned</option>
              <option>In Progress</option>
              <option>Installed</option>
              <option>Commissioned</option>
              <option>Active</option>
            </select>
          </div>
          <div className="mt-3">
            <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </Card>

        {fetchError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{fetchError}</p>}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Site ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Vendor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Completion</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Created</th>
                  {canManage && <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{site.siteId}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{site.location.address}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{site.vendor}</td>
                    <td className="py-3 px-4"><Badge type="status">{site.installationStatus}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${site.completionPercentage}%` }} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{site.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">{formatDate(site.createdAt)}</td>
                    {canManage && (
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEdit(site)}><Pencil size={14} /></Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(site.siteId)}><Trash2 size={14} /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
            <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={handleClose}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{editMode ? 'Edit Site' : 'Add New Site'}</h2>
              <button onClick={handleClose} className="text-gray-600 dark:text-gray-300"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <Input label="Site ID *" type="text" value={formData.siteId} onChange={(e) => setFormData({ ...formData, siteId: e.target.value.toUpperCase() })} required disabled={editMode} />
              <Input label="Address *" type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude *" type="number" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} required />
                <Input label="Longitude *" type="number" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Vendor</label>
                <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 border-gray-300" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}>
                  {vendors.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Installation Status</label>
                <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 border-gray-300" value={formData.installationStatus} onChange={(e) => setFormData({ ...formData, installationStatus: e.target.value })}>
                  <option>Planned</option>
                  <option>In Progress</option>
                  <option>Installed</option>
                  <option>Commissioned</option>
                  <option>Active</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notes</label>
                <textarea rows={3} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 border-gray-300" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
              </div>

              {formError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}

              <div className="flex justify-end gap-3 mt-2">
                <Button variant="secondary" type="button" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editMode ? 'Update Site' : 'Create Site'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sites;
