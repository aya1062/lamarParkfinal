import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Crown, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFormValidation, loginSchema } from '../../hooks/useFormValidation';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useFormValidation(loginSchema);

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data: any) => {
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح!');
        navigate(from, { replace: true });
      } else {
        toast.error('بيانات تسجيل الدخول غير صحيحة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="جاري تسجيل الدخول..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-12 w-12 text-gold" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بعودتك
          </h2>
          <p className="text-gray-600">
            سجل دخولك للوصول إلى حسابك في لمار بارك
          </p>
        </div>


        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className={`input-rtl pl-12 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="أدخل بريدك الإلكتروني"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {typeof errors.email?.message === 'string' && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`input-rtl pl-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="أدخل كلمة المرور"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {typeof errors.password?.message === 'string' && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="ml-2 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">تذكرني</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm text-gold hover:text-gold-light">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                isLoading || !isValid
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'btn-gold'
              }`}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="font-medium text-gold hover:text-gold-light">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 ml-2" />
            <p className="text-sm text-blue-800">
              معلوماتك محمية بأعلى معايير الأمان والخصوصية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;