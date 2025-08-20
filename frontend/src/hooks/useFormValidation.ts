import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// مخططات التحقق
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  password: yup
    .string()
    .required('كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
});

export const registerSchema = yup.object({
  firstName: yup
    .string()
    .required('الاسم الأول مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  lastName: yup
    .string()
    .required('الاسم الأخير مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(/^(	66|0)?[5][0-9]{8}$/, 'يرجى إدخال رقم هاتف سعودي صحيح'),
  address: yup
    .string()
    .required('العنوان مطلوب')
    .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  nationalId: yup
    .string()
    .required('رقم الهوية الوطنية مطلوب')
    .matches(/^\d{10}$/,'رقم الهوية يجب أن يكون 10 أرقام'),
  password: yup
    .string()
    .required('كلمة المرور مطلوبة')
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  confirmPassword: yup
    .string()
    .required('تأكيد كلمة المرور مطلوب')
    .oneOf([yup.ref('password')], 'كلمات المرور غير متطابقة'),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'يجب الموافقة على الشروط والأحكام')
});

export const bookingSchema = yup.object({
  fullName: yup
    .string()
    .required('الاسم الكامل مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(/^(\+966|0)?[5][0-9]{8}$/, 'يرجى إدخال رقم هاتف سعودي صحيح'),
  guests: yup
    .number()
    .required('عدد الأشخاص مطلوب')
    .min(1, 'يجب أن يكون هناك شخص واحد على الأقل')
    .max(10, 'الحد الأقصى 10 أشخاص'),
  paymentMethod: yup
    .string()
    .required('طريقة الدفع مطلوبة')
    .oneOf(['cash', 'card'], 'يرجى اختيار طريقة دفع صحيحة')
});

export const contactSchema = yup.object({
  name: yup
    .string()
    .required('الاسم مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: yup
    .string()
    .required('البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: yup
    .string()
    .required('رقم الهاتف مطلوب')
    .matches(/^(\+966|0)?[5][0-9]{8}$/, 'يرجى إدخال رقم هاتف سعودي صحيح'),
  subject: yup
    .string()
    .required('موضوع الرسالة مطلوب'),
  message: yup
    .string()
    .required('الرسالة مطلوبة')
    .min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل')
});

// Hook مخصص للتحقق من النماذج
export const useFormValidation = (schema: any) => {
  return useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });
};