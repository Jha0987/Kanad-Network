export const ROLE_ACCESS = {
  Admin: ['dashboard', 'sites', 'commissioning', 'configuration', 'alarms', 'reports', 'map'],
  'Field Engineer': ['sites', 'commissioning', 'configuration', 'map'],
  'NOC Engineer': ['alarms', 'map'],
  Manager: ['dashboard', 'reports', 'configuration', 'sites', 'map']
};

export const canAccessModule = (role, moduleName) => {
  if (!role) return false;
  return (ROLE_ACCESS[role] || []).includes(moduleName);
};
