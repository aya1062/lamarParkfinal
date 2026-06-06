import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Calculator, Megaphone, Users, 
  Award, Wrench, Shield, UserCheck,
  TrendingUp, ShieldCheck, DollarSign, FileText,
  Percent, Globe, Compass, PieChart,
  GraduationCap, BarChart2, Heart, UserPlus,
  ShieldAlert, Star, Sparkles, HelpCircle, CheckCircle2, ChevronDown
} from 'lucide-react';

const HotelManagementSection = () => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const managementPillars = [
    {
      title: 'إدارة التشغيل',
      icon: <Settings className="w-8 h-8 text-[#3d2c0d] group-hover:rotate-45 transition-transform duration-500" />,
      desc: 'نضمن أعلى معايير الجودة في التشغيل اليومي لتحقيق تجربة استثنائية للضيوف وزيادة الكفاءة التشغيلية.',
      path: '/services/operations-management',
      subItems: [
        { label: 'خدمة الضيوف', icon: <UserCheck className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'الأمن والسلامة', icon: <Shield className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'الصيانة', icon: <Wrench className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'الجودة', icon: <Award className="w-5 h-5 text-[#f5d796]" /> }
      ]
    },
    {
      title: 'إدارة المحاسبة',
      icon: <Calculator className="w-8 h-8 text-[#3d2c0d] group-hover:scale-110 transition-transform duration-500" />,
      desc: 'نقدم حلولاً مالية دقيقة وشفافة تعزز من الربحية وتضمن الالتزام بأعلى المعايير المحاسبية.',
      path: '/services/accounting-management',
      subItems: [
        { label: 'الميزانيات', icon: <FileText className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'إدارة التكاليف', icon: <DollarSign className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'الرقابة المالية', icon: <ShieldCheck className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'التأثير المالي', icon: <TrendingUp className="w-5 h-5 text-[#f5d796]" /> }
      ]
    },
    {
      title: 'إدارة التسويق',
      icon: <Megaphone className="w-8 h-8 text-[#3d2c0d] group-hover:-rotate-12 transition-transform duration-500" />,
      desc: 'نبتكر استراتيجيات تسويقية فعالة لزيادة الحضور، تعزيز العلامة التجارية، وتحقيق أعلى معدلات الإشغال.',
      path: '/services/marketing-management',
      subItems: [
        { label: 'تحليل السوق', icon: <PieChart className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'المبيعات', icon: <Compass className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'التسويق الرقمي', icon: <Globe className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'إدارة العوائد', icon: <Percent className="w-5 h-5 text-[#f5d796]" /> }
      ]
    },
    {
      title: 'إدارة الموارد البشرية',
      icon: <Users className="w-8 h-8 text-[#3d2c0d] group-hover:translate-y-[-2px] transition-transform duration-500" />,
      desc: 'نستقطب ونطور أفضل الكفاءات لتهيئة بيئة عمل محفزة تحقق التميز وتدعم النمو المستدام.',
      path: '/services/hr-management',
      subItems: [
        { label: 'التطوير والتدريب', icon: <GraduationCap className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'إدارة الأداء', icon: <BarChart2 className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'علاقات الموظفين', icon: <Heart className="w-5 h-5 text-[#f5d796]" /> },
        { label: 'استقطاب المواهب', icon: <UserPlus className="w-5 h-5 text-[#f5d796]" /> }
      ]
    }
  ];

  return (
    <section className="relative bg-[#faf9f6] py-16 overflow-hidden font-sans" dir="rtl">
      {/* Decorative top border glow */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a55a]/40 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Card mimicking the Infographic structure */}
        <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#c9a55a]/25 mb-12 bg-[#f4ebd4]">
          <div className="flex flex-col lg:flex-row min-h-[460px]">
            
            {/* Left side: Wavy Cream-colored Content Area */}
            <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#f4ebd4] via-[#faf4e5] to-[#f4ebd4] p-8 md:p-12 flex flex-col justify-between relative z-10">
              
              {/* Logo & Header Details */}
              <div className="text-right">
                <div className="mb-6 flex items-center justify-start gap-4">
                  <div className="bg-[#1c1917] p-2.5 rounded-2xl shadow-md border border-[#c9a55a]/30">
                    <img 
                      src="/lamar/logo بدون خلفية.png" 
                      alt="Lamar Park Logo" 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-wider">LAMAR PARK</h2>
                    <h3 className="text-xs font-bold text-[#8a6d2c] tracking-widest mt-0.5">لامار بارك لتشغيل الفنادق والمنتجعات</h3>
                  </div>
                </div>

                <div className="h-px w-24 bg-gradient-to-l from-[#c9a55a] to-transparent mb-6"></div>

                <h1 className="text-3xl md:text-[2.25rem] font-black text-[#1c1917] leading-tight mb-4">
                  إدارة احترافية .. تشغيل متميز
                </h1>
                <p className="text-base md:text-lg text-[#8a6d2c] font-bold opacity-90 leading-relaxed mb-8">
                  نرتقي بتجربة الضيوف .. ونحقق نجاح استدامة لعملائنا
                </p>
              </div>

              {/* Four Golden Row Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mt-auto">
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full border-2 border-[#c9a55a] flex items-center justify-center mb-2 bg-[#faf4e5] group-hover:bg-[#c9a55a]/10 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-[#8a6d2c]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1c1917] leading-snug">معايير تشغيل<br/>عالمية</span>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full border-2 border-[#c9a55a] flex items-center justify-center mb-2 bg-[#faf4e5] group-hover:bg-[#c9a55a]/10 transition-colors">
                    <TrendingUp className="w-5 h-5 text-[#8a6d2c]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1c1917] leading-snug">رفع الكفاءة<br/>التشغيلية</span>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full border-2 border-[#c9a55a] flex items-center justify-center mb-2 bg-[#faf4e5] group-hover:bg-[#c9a55a]/10 transition-colors">
                    <Star className="w-5 h-5 text-[#8a6d2c]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1c1917] leading-snug">تحقيق رضا<br/>الضيوف</span>
                </div>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full border-2 border-[#c9a55a] flex items-center justify-center mb-2 bg-[#faf4e5] group-hover:bg-[#c9a55a]/10 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-[#8a6d2c]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1c1917] leading-snug">عائد استثماري<br/>مستدام</span>
                </div>
              </div>

            </div>

            {/* Wavy separator (visible only on desktop) */}
      <div className="hidden lg:block absolute left-[54.5%] top-0 bottom-0 w-20 z-20 pointer-events-none">
        <svg className="h-full w-full text-[#f4ebd4] fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M100,0 Q30,50 100,100 L0,100 L0,0 Z" />
        </svg>
        {/* Golden Wave Line overlay */}
        <svg className="absolute inset-0 h-full w-full text-[#f4ebd4] fill-none stroke-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M100,0 Q30,50 100,100" />
        </svg>
      </div>

            {/* Right side: Luxurious Dusk Resort Photo */}
            <div 
              className="w-full lg:w-[75%] relative min-h-[300px] lg:min-h-auto bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop')`
              }}
            >
              {/* Radial overlay to blend */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/0 to-black/30 lg:bg-gradient-to-r lg:from-black/10 lg:to-transparent"></div>
            </div>

          </div>
        </div>

        {/* 4 Pillars - Luxurious Dark Gold Metallic Cards Grid (Desktop View) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto mb-16 mt-16">
          {managementPillars.map((pillar, index) => (
            <div 
              key={index}
              onClick={() => navigate(pillar.path)}
              className="group cursor-pointer relative rounded-3xl p-6 bg-gradient-to-b from-[#8a6d2c] via-[#755920] to-[#5c4719] border border-[#d4af37]/30 shadow-xl hover:shadow-[0_20px_40px_rgba(201,165,90,0.25)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* Overlapping gold circular icon */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#f5d796] border-[4px] border-[#faf9f6] flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-500 z-30">
                {pillar.icon}
              </div>

              {/* Shimmer effect inside cards */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none"></div>

              <div className="pt-6 text-center">
                <h4 className="text-xl md:text-2xl font-black text-white mb-4 drop-shadow-sm group-hover:text-[#faf4e5] transition-colors">
                  {pillar.title}
                </h4>
                <p className="text-[#fcf8ef]/80 text-sm leading-relaxed text-center px-2 mb-8 font-medium">
                  {pillar.desc}
                </p>
              </div>

              {/* Bottom sub-items list: small golden icons and labels */}
              <div className="border-t border-[#f5d796]/20 pt-4 mt-auto">
                <div className="grid grid-cols-4 gap-1 text-center">
                  {pillar.subItems.map((sub, sIndex) => (
                    <div key={sIndex} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-[#f5d796]/10 flex items-center justify-center mb-1.5 group-hover:bg-[#f5d796]/10 group-hover:border-[#f5d796]/25 transition-all duration-300">
                        {sub.icon}
                      </div>
                      <span className="text-[10px] font-bold text-[#f5d796] tracking-tighter truncate max-w-full leading-tight block whitespace-nowrap">
                        {sub.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* 4 Pillars - Accordion View (Mobile View) */}
        <div className="block md:hidden max-w-2xl mx-auto mb-16 mt-12 space-y-5 px-1">
          {managementPillars.map((pillar, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div 
                key={index}
                className="rounded-2xl border border-[#d4af37]/35 bg-gradient-to-b from-[#8a6d2c] via-[#755920] to-[#5c4719] shadow-lg overflow-hidden transition-all duration-300"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-right focus:outline-none select-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-4">
                    {/* Golden circular icon */}
                    <div className="w-12 h-12 rounded-full bg-[#f5d796] flex items-center justify-center shadow-md shrink-0">
                      {React.cloneElement(pillar.icon, { className: "w-6 h-6 text-[#3d2c0d]" })}
                    </div>
                    <span className="text-lg font-black text-white drop-shadow-sm">
                      {pillar.title}
                    </span>
                  </div>
                  
                  {/* Chevron down icon */}
                  <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-[#f5d796]" />
                  </div>
                </button>

                {/* Accordion Content with smooth height transition */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[500px] opacity-100 border-t border-[#f5d796]/20' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 flex flex-col gap-5">
                    {/* Pillar Description */}
                    <p className="text-[#fcf8ef]/95 text-[14px] leading-relaxed font-medium">
                      {pillar.desc}
                    </p>

                    {/* Sub-Items List */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#f5d796]/10">
                      {pillar.subItems.map((sub, sIndex) => (
                        <div key={sIndex} className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-[#f5d796]/15 flex items-center justify-center mb-1.5 shadow-sm">
                            {sub.icon}
                          </div>
                          <span className="text-[10px] font-bold text-[#f5d796] tracking-tighter truncate max-w-full text-center leading-tight">
                            {sub.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button to Navigate */}
                    <button
                      onClick={() => navigate(pillar.path)}
                      className="w-full mt-2 py-3 px-5 bg-[#f5d796] hover:bg-[#faf4e5] active:bg-[#e4c685] text-[#3d2c0d] font-black text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>استكشف الخدمة</span>
                      <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Values & Badges Bar matching the exact look of the image */}
        <div className="rounded-2xl bg-gradient-to-r from-[#241f17] via-[#17140f] to-[#241f17] p-5 border border-[#c9a55a]/30 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center text-[#f5d796] font-bold text-xs md:text-sm">
            
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#c9a55a] animate-pulse"></span>
              <p className="tracking-wide">قيمنا .. جودة، احترافية، شغف</p>
            </div>

            <div className="hidden md:block w-px h-6 bg-[#c9a55a]/30"></div>

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#c9a55a] animate-pulse"></span>
              <p className="tracking-wide">قيمنا: تتجاوز التوقعات</p>
            </div>

            <div className="hidden md:block w-px h-6 bg-[#c9a55a]/30"></div>

            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#c9a55a] animate-pulse"></span>
              <p className="tracking-wide">شريكك في النجاح خبرة التوقعات</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HotelManagementSection;
