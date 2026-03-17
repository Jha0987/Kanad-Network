import { cn, getSeverityColor, getStatusColor } from '../../utils/helpers';

const Badge = ({ children, variant = 'default', type = 'status' }) => {
  const getColor = () => {
    if (type === 'severity') return getSeverityColor(children);
    if (type === 'status') return getStatusColor(children);
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span
      className={cn(
        'px-2 py-1 rounded text-xs font-semibold inline-block',
        getColor()
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
