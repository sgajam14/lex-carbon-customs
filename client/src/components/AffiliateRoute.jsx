import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AffiliateRoute({ children }) {
  const { user, loading, isAffiliate } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAffiliate) return <Navigate to="/" replace />;
  return children;
}
