import React from 'react';
import { Shield, Award, Clock, HeartHandshake, Crown, Sparkles } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'أمان وثقة',
      description: 'نضمن لك حجزاً آمناً وموثوقاً مع إمكانية الإلغاء المجاني'
    },
    {
      icon: Award,
      title: 'جودة مضمونة',
      description: 'عقارات مختارة بعناية لتضمن لك تجربة إقامة استثنائية'
    },
    {
      icon: Clock,
      title: 'خدمة 24/7',
      description: 'فريق خدمة العملاء متاح على مدار الساعة لمساعدتك'
    },
    {
      icon: HeartHandshake,
      title: 'أسعار تنافسية',
      description: 'أفضل الأسعار مع عروض حصرية وخصومات مميزة'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-gold" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            لماذا تختار لمار بارك؟
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            نحن نقدم لك تجربة حجز مميزة مع مجموعة واسعة من أفخم الفنادق والشاليهات في المملكة العربية السعودية. 
            رحلتك تبدأ معنا بخطوة واحدة نحو الراحة والأناقة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold bg-opacity-10 rounded-full mb-6 group-hover:bg-gold group-hover:bg-opacity-20 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-gold to-gold-light rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10">
            <Sparkles className="h-16 w-16 mx-auto mb-6 text-white" />
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              ابدأ رحلتك الفاخرة اليوم
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              احجز إقامتك المثالية واستمتع بتجربة لا تُنسى في أروع الوجهات السياحية
            </p>
            <button className="bg-white text-gold px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
              استكشف عروضنا الحصرية
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;