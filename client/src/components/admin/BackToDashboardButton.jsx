import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackToDashboardButton({ className = '' }) {
  return (
    <Link
      to="/admin"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border dark:border-dark-border border-light-border dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 hover:border-brand-red/40 transition-colors text-sm ${className}`}
    >
      <ArrowLeft size={14} />
      Back to Dashboard
    </Link>
  );
}
