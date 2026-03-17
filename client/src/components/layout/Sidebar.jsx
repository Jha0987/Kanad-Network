import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  CheckCircle,
  Settings,
  AlertTriangle,
  FileText,
  MapPinned
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { canAccessModule } from '../../utils/rbac';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
    { path: '/sites', icon: Radio, label: 'Sites', module: 'sites' },
    { path: '/commissioning', icon: CheckCircle, label: 'Commissioning', module: 'commissioning' },
    { path: '/configuration', icon: Settings, label: 'Configuration', module: 'configuration' },
    { path: '/alarms', icon: AlertTriangle, label: 'Alarms', module: 'alarms' },
    { path: '/reports', icon: FileText, label: 'Reports', module: 'reports' },
    { path: '/network-map', icon: MapPinned, label: 'Network Map', module: 'map' }
  ].filter((item) => canAccessModule(user?.role, item.module));

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
        isOpen ? 'w-64' : 'w-0 -translate-x-full'
      )}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
