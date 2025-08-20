import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, User, Mail, Lock, Phone, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFormValidation, registerSchema } from '../../hooks/useFormValidation';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useFormValidation(registerSchema);

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: any) => {
    try {
      // دمج الاسم الأول والأخير في حقل واحد
      const name = `${data.firstName} ${data.lastName}`.trim();
      const payload = { ...data, name };
      delete payload.firstName;
      delete payload.lastName;
      console.log('Register payload:', payload); // تحقق من الحقول المرسلة
      const success = await registerUser(payload);
      if (success) {
        toast.success('تم إنشاء حسابك بنجاح!');
        navigate('/');
      } else {
        toast.error(res?.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الحساب');
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = password ? getPasswordStrength(password) : 0;

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'ضعيفة';
    if (passwordStrength <= 3) return 'متوسطة';
    return 'قوية';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-12 w-12 text-gold" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            إنشاء حساب جديد
          </h2>
          <p className="text-gray-600">
            انضم إلى لمار بارك واستمتع بتجربة حجز مميزة
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الأول *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('firstName')}
                    className={`input-rtl pl-12 ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="الاسم الأول"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الأخير *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('lastName')}
                    className={`input-rtl pl-12 ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="الاسم الأخير"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className={`input-rtl pl-12 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('phone')}
                  className={`input-rtl pl-12 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+966 50 123 4567"
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`input-rtl pl-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="أدخل كلمة مرور قوية"
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      قوة كلمة المرور: {getPasswordStrengthText()}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`input-rtl pl-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="أعد إدخال كلمة المرور"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {password === confirmPassword ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 ml-1" />
                      <span>كلمات المرور متطابقة</span>
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">
                      كلمات المرور غير متطابقة
                    </div>
                  )}
                </div>
              )}
              
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('address')}
                  className={`input-rtl pl-12 ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="المدينة، الحي، الشارع ..."
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهوية الوطنية *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('nationalId')}
                  className={`input-rtl pl-12 ${errors.nationalId ? 'border-red-500' : ''}`}
                  placeholder="أدخل رقم الهوية الوطنية (10 أرقام)"
                  maxLength={10}
                />
                <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.nationalId && (
                <p className="mt-1 text-sm text-red-600">{errors.nationalId.message}</p>
              )}
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="mt-1 ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  أوافق على{' '}
                  <Link to="/terms" className="text-gold hover:text-gold-light">الشروط والأحكام</Link>
                  {' '}و{' '}
                  <Link to="/privacy" className="text-gold hover:text-gold-light">سياسة الخصوصية</Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('subscribeNewsletter')}
                  className="mt-1 ml-3 h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  أرغب في تلقي العروض الخاصة والأخبار عبر البريد الإلكتروني
                </span>
              </label>
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
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-medium text-gold hover:text-gold-light">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 ml-2" />
            <p className="text-sm text-blue-800">
              جميع بياناتك الشخصية محمية ومشفرة بأعلى معايير الأمان
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;