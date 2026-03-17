import { cn } from '../../utils/helpers';

const Card = ({ children, className, title, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6',
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
