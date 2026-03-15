import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard
    const redirectMap = {
      'ROLE_SUPER_ADMIN': '/superadmin',
      'ROLE_ADMIN': '/admin',
      'ROLE_SELLER': '/seller',
      'ROLE_CUSTOMER': '/',
    };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }

  return children;
}