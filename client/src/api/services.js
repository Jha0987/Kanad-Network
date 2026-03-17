import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

export const siteAPI = {
  getAll: (params) => api.get('/sites', { params }),
  getById: (siteId) => api.get(`/sites/${siteId}`),
  create: (data) => api.post('/sites', data),
  update: (siteId, data) => api.put(`/sites/${siteId}`, data),
  delete: (siteId) => api.delete(`/sites/${siteId}`),
  getStats: () => api.get('/sites/stats'),
  getMapView: (params) => api.get('/sites/map-view', { params })
};

export const alarmAPI = {
  getAll: (params) => api.get('/alarms', { params }),
  getById: (id) => api.get(`/alarms/${id}`),
  create: (data) => api.post('/alarms', data),
  update: (id, data) => api.put(`/alarms/${id}`, data),
  assignEngineer: (id, engineerId) => api.patch(`/alarms/${id}/assign`, { engineerId }),
  delete: (id) => api.delete(`/alarms/${id}`),
  getStats: () => api.get('/alarms/stats'),
  simulate: (count = 5) => api.post('/alarms/simulate', { count })
};

export const commissioningAPI = {
  getAll: (params) => api.get('/commissioning', { params }),
  getBySite: (siteId) => api.get(`/commissioning/${siteId}`),
  create: (data) => api.post('/commissioning', data),
  updateChecklistItem: (siteId, itemId, data) => api.patch(`/commissioning/${siteId}/checklist/${itemId}`, data)
};

export const configurationAPI = {
  create: (data) => api.post('/configurations', data),
  getLatest: (siteId) => api.get(`/configurations/${siteId}/latest`),
  getHistory: (siteId, params) => api.get(`/configurations/${siteId}/history`, { params }),
  compare: (siteId, version1, version2) => api.get(`/configurations/${siteId}/compare`, { params: { version1, version2 } }),
  rollback: (siteId, targetVersion) => api.post(`/configurations/${siteId}/rollback`, { targetVersion })
};

export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getChartData: () => api.get('/dashboard/charts')
};

export const reportAPI = {
  getKpis: (params) => api.get('/reports/kpis', { params }),
  exportCsv: (params) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' })
};

export const auditAPI = {
  getLogs: (params) => api.get('/audits', { params })
};
