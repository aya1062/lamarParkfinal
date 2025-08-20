import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer' | 'manager';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (user?.status === 'inactive') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">تم تعطيل حسابك</h2>
        <p className="text-gray-700 mb-2">حسابك معطل حالياً ولا يمكنك استخدام النظام.</p>
        <p className="text-gray-700 mb-6">يرجى التواصل مع الدعم لمعرفة السبب أو إعادة التفعيل.</p>
        <a
          href="mailto:support@lamarpark.sa?subject=طلب%20مساعدة%20بخصوص%20تعطيل%20الحساب"
          className="inline-block bg-gold text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-yellow-600 transition-colors duration-300"
        >
          تواصل مع الدعم
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;