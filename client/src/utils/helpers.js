import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getSeverityColor = (severity) => {
  const colors = {
    Critical: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200',
    Major: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200',
    Minor: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
  };
  return colors[severity] || 'text-gray-600 bg-gray-100';
};

export const getStatusColor = (status) => {
  const colors = {
    Open: 'text-red-600 bg-red-100',
    'In Progress': 'text-blue-600 bg-blue-100',
    Resolved: 'text-green-600 bg-green-100',
    Planned: 'text-gray-600 bg-gray-100',
    Installed: 'text-blue-600 bg-blue-100',
    Commissioned: 'text-green-600 bg-green-100',
    Active: 'text-green-600 bg-green-100'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};
