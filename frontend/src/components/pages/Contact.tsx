import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, HeadphonesIcon } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: 'اتصل بنا',
      details: ['+966 50 123 4567', '+966 11 456 7890'],
      description: 'متاح 24/7 لخدمتك'
    },
    {
      icon: Mail,
      title: 'راسلنا',
      details: ['info@lamarpark.sa', 'support@lamarpark.sa'],
      description: 'نرد خلال ساعتين'
    },
    {
      icon: MapPin,
      title: 'زورنا',
      details: ['الرياض، حي الملك فهد', 'مجمع الأعمال التجاري'],
      description: 'من الأحد إلى الخميس'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: ['الأحد - الخميس: 8ص - 10م', 'الجمعة - السبت: 10ص - 8م'],
      description: 'خدمة العملاء متاحة دائماً'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <MessageCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            تم إرسال رسالتك بنجاح!
          </h2>
          <p className="text-gray-600 mb-6">
            شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="btn-gold w-full"
          >
            إرسال رسالة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gold to-gold-light text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HeadphonesIcon className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">تواصل معنا</h1>
          <p className="text-xl max-w-2xl mx-auto">
            نحن هنا لمساعدتك في أي وقت. تواصل معنا وسنكون سعداء بخدمتك
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                فريق خدمة العملاء لدينا متاح على مدار الساعة لمساعدتك في جميع استفساراتك 
                وحجوزاتك. لا تتردد في التواصل معنا بأي طريقة تناسبك.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gold bg-opacity-10 rounded-lg flex items-center justify-center ml-4">
                      <info.icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{info.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                    ))}
                    <p className="text-gray-500 text-sm">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">موقعنا على الخريطة</h3>
                  <p>الرياض، المملكة العربية السعودية</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-rtl"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-rtl"
                    placeholder="+966 50 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-rtl"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موضوع الرسالة *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="input-rtl"
                >
                  <option value="">اختر موضوع الرسالة</option>
                  <option value="booking">استفسار عن حجز</option>
                  <option value="complaint">شكوى</option>
                  <option value="suggestion">اقتراح</option>
                  <option value="partnership">شراكة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="input-rtl"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'btn-gold'
                }`}
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">الأسئلة الشائعة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">كيف يمكنني إلغاء حجزي؟</h3>
                <p className="text-gray-600">يمكنك إلغاء حجزك مجاناً حتى 24 ساعة قبل موعد الوصول من خلال حسابك أو بالاتصال بنا.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">هل يمكنني تعديل تواريخ حجزي؟</h3>
                <p className="text-gray-600">نعم، يمكنك تعديل تواريخ حجزك حسب التوفر وسياسة العقار المحجوز.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">ما هي طرق الدفع المتاحة؟</h3>
                <p className="text-gray-600">نقبل جميع البطاقات الائتمانية الرئيسية، كما يمكنك الدفع عند الوصول في معظم العقارات.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">هل الأسعار شاملة الضرائب؟</h3>
                <p className="text-gray-600">نعم، جميع الأسعار المعروضة شاملة ضريبة القيمة المضافة والرسوم الإضافية.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">كيف أحصل على فاتورة حجزي؟</h3>
                <p className="text-gray-600">ستصلك الفاتورة تلقائياً على بريدك الإلكتروني بعد تأكيد الحجز.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">هل تقدمون خدمة النقل من المطار؟</h3>
                <p className="text-gray-600">تختلف هذه الخدمة حسب العقار. يمكنك التحقق من التفاصيل في صفحة العقار أو الاتصال بنا.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;