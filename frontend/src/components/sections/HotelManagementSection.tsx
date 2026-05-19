import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Calculator, Megaphone, Users, ArrowUpRight, ShieldCheck, Sparkles, Building } from 'lucide-react';

const HotelManagementSection = () => {
  const navigate = useNavigate();

  const managementPillars = [
    {
      title: 'إدارة التشغيل',
      icon: <Settings className="w-8 h-8 text-[#c9a55a] group-hover:rotate-45 transition-transform duration-500" />,
      desc: 'نضمن أعلى معايير الجودة في التشغيل اليومي للفنادق والمنتجعات مع تحسين تكلفة التشغيل.',
      features: ['التشغيل اليومي', 'رقابة الجودة', 'إدارة الصيانة', 'الأمن والسلامة', 'خدمة الضيوف', 'التوريد'],
      path: '/services/operations-management',
      colorGlow: 'rgba(201, 165, 90, 0.15)'
    },
    {
      title: 'إدارة المحاسبة',
      icon: <Calculator className="w-8 h-8 text-[#c9a55a] group-hover:scale-110 transition-transform duration-500" />,
      desc: 'نقدم حلولاً مالية دقيقة وشفافة تضمن أمان المداخيل وتدعم اتخاذ القرار بالتحليل المالي.',
      features: ['الميزانيات', 'إدارة التكاليف', 'التقارير المالية', 'الرقابة المالية', 'المشتريات', 'المدفوعات'],
      path: '/services/accounting-management',
      colorGlow: 'rgba(201, 165, 90, 0.15)'
    },
    {
      title: 'إدارة التسويق',
      icon: <Megaphone className="w-8 h-8 text-[#c9a55a] group-hover:-rotate-12 transition-transform duration-500" />,
      desc: 'نبتكر استراتيجيات تسويقية فعالة لزيادة الحضور، تعزيز العلامة التجارية والوصول لأعلى معدلات الإشغال.',
      features: ['تحليل السوق', 'المبيعات', 'التسويق الرقمي', 'إدارة القنوات', 'العلاقات العامة', 'الحملات الإعلانية'],
      path: '/services/marketing-management',
      colorGlow: 'rgba(201, 165, 90, 0.15)'
    },
    {
      title: 'إدارة الموارد البشرية',
      icon: <Users className="w-8 h-8 text-[#c9a55a] group-hover:translate-y-[-2px] transition-transform duration-500" />,
      desc: 'نستقطب ونطور أفضل الكفاءات لبناء فرق عمل محترفة تضمن التميز وتقدم الدعم التشغيلي المستمر.',
      features: ['الاستقطاب والتوطين', 'تدريب وتطوير', 'تقييم الأداء', 'علاقات الموظفين', 'الهيكل التنظيمي'],
      path: '/services/hr-management',
      colorGlow: 'rgba(201, 165, 90, 0.15)'
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-[#faf9f6] to-white overflow-hidden" dir="rtl">
      {/* Abstract Background Glows */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#c9a55a]/5 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#DfB86c]/5 blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a55a]/10 border border-[#c9a55a]/20 mb-4 shadow-sm">
            <Building className="w-4 h-4 text-[#c9a55a]" />
            <span className="text-xs md:text-sm font-bold text-[#8a6d2c] tracking-wider">التشغيل الفندقي الاحترافي</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            قسم إدارة الفنادق والمنتجعات
          </h2>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent mx-auto"></div>
        </div>

        {/* Infographic Main Banner Card */}
        <div className="max-w-[1100px] mx-auto mb-16">
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-[#c9a55a]/30 shadow-2xl bg-gradient-to-br from-[#1c1917] to-[#0c0a09] text-white">
            {/* Elegant brand glows and overlay patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a55a]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DfB86c]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="max-w-2xl text-right">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-gold font-bold tracking-widest text-sm uppercase">LAMAR PARK</span>
                  <div className="h-px w-10 bg-gold/50"></div>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-l from-white via-gray-100 to-gold bg-clip-text text-transparent">
                  إدارة احترافية .. تشغيل متميز
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  نلبي تجربة الضيوف المتكاملة والراقية .. ونحقق أرباحاً مستدامة ونمواً استثمارياً طويل الأمد لملاك العقارات من خلال تفعيل ركائز الإدارة الذكية والحلول الفندقية الشاملة.
                </p>
              </div>

              <div className="flex-shrink-0 flex justify-center md:justify-end">
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-gold/20 to-gold/40 border border-gold/40 flex items-center justify-center shadow-[0_0_30px_rgba(201,165,90,0.3)] animate-pulse">
                  <img 
                    src="/lamar/logo بدون خلفية.png" 
                    alt="لامار بارك" 
                    className="w-20 h-auto object-contain md:w-28 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Interactive Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto mb-16">
          {managementPillars.map((pillar, index) => (
            <div 
              key={index}
              onClick={() => navigate(pillar.path)}
              className="group cursor-pointer relative overflow-hidden rounded-3xl p-6 bg-white border border-gray-100/80 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between"
              style={{
                boxShadow: `0 15px 30px -10px rgba(0, 0, 0, 0.03), 0 0 40px 0 ${pillar.colorGlow}`
              }}
            >
              {/* Internal Card Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#c9a55a]/0 to-[#c9a55a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div>
                {/* Icon Circle */}
                <div className="w-14 h-14 rounded-2xl bg-[#c9a55a]/10 flex items-center justify-center mb-6 group-hover:bg-[#c9a55a] transition-all duration-500">
                  <div className="group-hover:text-white transition-colors duration-500">
                    {pillar.icon}
                  </div>
                </div>

                <h4 className="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-[#8a6d2c] transition-colors duration-300">
                  {pillar.title}
                </h4>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {pillar.desc}
                </p>
              </div>

              {/* Sub-elements bullet grid */}
              <div>
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <span className="text-xs font-bold text-gray-400 block mb-3 uppercase tracking-wider">الخدمات الفرعية:</span>
                  <div className="flex flex-wrap gap-2">
                    {pillar.features.map((feat, fIndex) => (
                      <span 
                        key={fIndex} 
                        className="text-xs font-semibold px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg group-hover:bg-[#c9a55a]/10 group-hover:text-[#8a6d2c] transition-all duration-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="flex items-center justify-between text-sm font-bold text-[#c9a55a] group-hover:text-[#8a6d2c]">
                  <span>عرض التفاصيل</span>
                  <div className="w-8 h-8 rounded-full bg-[#c9a55a]/10 flex items-center justify-center group-hover:bg-[#c9a55a] group-hover:text-white transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:translate-y-[-0.5px] transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Download/Navigation Buttons */}
        <div className="max-w-[900px] mx-auto border-t border-gray-100 pt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {managementPillars.map((pillar, index) => (
              <button
                key={index}
                onClick={() => navigate(pillar.path)}
                className="group relative flex items-center justify-between px-6 py-4 rounded-2xl bg-white border border-gray-200/80 hover:border-[#c9a55a] text-[#8a6d2c] font-bold text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a55a]/10 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="relative z-10 truncate">{pillar.title}</span>
                <div className="relative z-10 w-8 h-8 bg-gray-50 group-hover:bg-[#c9a55a]/15 text-[#c9a55a] rounded-xl flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:translate-y-[-0.5px] transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HotelManagementSection;
