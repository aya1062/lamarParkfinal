import React from 'react';
import { Crown, Award, Shield, Users, MapPin, Clock, Heart, Star } from 'lucide-react';

const About = () => {
  const stats = [
    { number: '500+', label: 'عقار فاخر', icon: Crown },
    { number: '50,000+', label: 'عميل راضي', icon: Users },
    { number: '25+', label: 'مدينة سعودية', icon: MapPin },
    { number: '5', label: 'سنوات خبرة', icon: Award }
  ];

  const values = [
    {
      icon: Shield,
      title: 'الثقة والأمان',
      description: 'نضمن لك تجربة حجز آمنة وموثوقة مع حماية كاملة لبياناتك الشخصية والمالية'
    },
    {
      icon: Award,
      title: 'الجودة المضمونة',
      description: 'نختار عقاراتنا بعناية فائقة لنضمن لك أعلى مستويات الجودة والفخامة'
    },
    {
      icon: Heart,
      title: 'خدمة العملاء',
      description: 'فريق متخصص متاح على مدار الساعة لتقديم أفضل خدمة ومساعدة شخصية'
    },
    {
      icon: Star,
      title: 'التميز والإبداع',
      description: 'نسعى دائماً لتقديم تجارب استثنائية تفوق توقعات عملائنا الكرام'
    }
  ];

  const team = [
    {
      name: 'أحمد المحمد',
      position: 'المدير التنفيذي',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description: 'خبرة 15 عاماً في صناعة الضيافة والسياحة'
    },
    {
      name: 'فاطمة العلي',
      position: 'مديرة العمليات',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description: 'متخصصة في إدارة العقارات الفاخرة'
    },
    {
      name: 'محمد الخالد',
      position: 'مدير التسويق',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      description: 'خبير في التسويق الرقمي والعلاقات العامة'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gold to-gold-light text-white py-20">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">من نحن</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            لمار بارك هي منصة رائدة في مجال حجز الفنادق والشاليهات الفاخرة في المملكة العربية السعودية، 
            نقدم لعملائنا تجربة استثنائية تجمع بين الفخامة والراحة والخدمة المتميزة.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gold bg-opacity-10 rounded-full mb-4 group-hover:bg-gold group-hover:bg-opacity-20 transition-colors duration-300">
                  <stat.icon className="h-8 w-8 text-gold" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">قصتنا</h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  بدأت رحلة لمار بارك في عام 2019 برؤية واضحة: تقديم أفضل تجربة حجز للفنادق والشاليهات 
                  الفاخرة في المملكة العربية السعودية. منذ ذلك الحين، نمت منصتنا لتصبح الوجهة المفضلة 
                  للباحثين عن الإقامة المميزة.
                </p>
                <p>
                  نحن نؤمن بأن كل رحلة يجب أن تكون تجربة لا تُنسى، ولذلك نختار شركاءنا بعناية فائقة 
                  لنضمن أن كل عقار في منصتنا يلبي أعلى معايير الجودة والفخامة.
                </p>
                <p>
                  اليوم، نفخر بخدمة أكثر من 50,000 عميل راضي، ونواصل السعي لتطوير خدماتنا وتوسيع 
                  شبكة عقاراتنا لنكون دائماً في المقدمة.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="قصة لمار بارك"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black bg-opacity-20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">قيمنا ومبادئنا</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نستَرشد بمجموعة من القيم الأساسية التي تحدد هويتنا وتوجّه عملنا اليومي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gold bg-opacity-10 rounded-lg flex items-center justify-center">
                      <value.icon className="h-6 w-6 text-gold" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">فريق العمل</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              تعرف على الفريق المتميز الذي يعمل بجد لتقديم أفضل خدمة لعملائنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-gold font-semibold mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-gold to-gold-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">انضم إلى عائلة لمار بارك</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            ابدأ رحلتك معنا واكتشف عالماً من الفخامة والراحة في أجمل الوجهات السعودية
          </p>
          <button className="bg-white text-gold px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300">
            ابدأ الحجز الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;