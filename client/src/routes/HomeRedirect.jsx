import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessModule } from '../utils/rbac';

const orderedModules = [
  { module: 'dashboard', path: '/dashboard' },
  { module: 'sites', path: '/sites' },
  { module: 'alarms', path: '/alarms' },
  { module: 'reports', path: '/reports' },
  { module: 'map', path: '/network-map' }
];

const HomeRedirect = () => {
  const { user } = useAuth();

  const target = orderedModules.find((item) => canAccessModule(user?.role, item.module));
  return <Navigate to={target?.path || '/login'} replace />;
};

export default HomeRedirect;
