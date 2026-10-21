import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export { ProtectedRoute };
export { Login, Register };