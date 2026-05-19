import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Briefcase, Award, Network, ShieldCheck, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-20%] w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] bg-gradient-radial from-[#c9a55a]/10 to-transparent opacity-80 animate-glow-pulse" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[150vw] h-[150vw] md:w-[80vw] md:h-[80vw] bg-gradient-radial from-[#e8d5a5]/15 to-transparent opacity-70 animate-glow-pulse" style={{ animationDelay: '2s' }} />

      <div className="absolute top-[15%] left-[5%] animate-float text-[#c9a55a] opacity-20">
        <Users strokeWidth={1} className="w-14 h-14 md:w-20 md:h-20" />
      </div>
      <div className="absolute top-[35%] right-[8%] animate-float-reverse text-[#c9a55a] opacity-20" style={{ animationDelay: '1s' }}>
        <GraduationCap strokeWidth={1} className="w-16 h-16 md:w-24 md:h-24" />
      </div>
      <div className="absolute top-[60%] left-[10%] animate-float text-[#c9a55a] opacity-20" style={{ animationDelay: '2.5s' }}>
        <Briefcase strokeWidth={1} className="w-12 h-12 md:w-16 md:h-16" />
      </div>
      <div className="absolute bottom-[20%] right-[15%] animate-float-reverse text-[#c9a55a] opacity-20" style={{ animationDelay: '3.5s' }}>
        <Award strokeWidth={1} className="w-14 h-14 md:w-20 md:h-20" />
      </div>
      <div className="absolute top-[45%] left-[80%] animate-float text-[#c9a55a] opacity-30" style={{ animationDelay: '0.5s' }}>
        <Network strokeWidth={1} className="w-8 h-8 md:w-12 md:h-12" />
      </div>
      
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-[#c9a55a] rounded-full opacity-40 animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
            boxShadow: '0 0 10px 2px rgba(201, 165, 90, 0.5)'
          }}
        />
      ))}
    </div>
  );
};

const HRManagement = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyName: '',
    propertyType: 'hotel',
    location: '',
    message: ''
  });

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setFormSubmitted(true);
    }, 800);
  };

  const pillars = [
    { title: 'الاستقطاب والتوطين (السعودة)', desc: 'جذب واستقطاب أفضل الكفاءات الوطنية المتخصصة في الضيافة ودعم استراتيجيات التوطين الحكومية.' },
    { title: 'التدريب والتطوير المستمر', desc: 'إعداد برامج تدريبية متطورة لتنمية مهارات التفاعل وجودة الخدمة ورفع كفاءة موظفي الضيافة.' },
    { title: 'تقييم الأداء والمتابعة', desc: 'تطبيق أدوات تقييم أداء عملية وواضحة (KPIs) لربط الحوافز بالتميز التشغيلي والإنتاجية.' },
    { title: 'علاقات وإدارة الموظفين', desc: 'تعزيز بيئة عمل صحية وإيجابية تحفز الإبداع وتضمن الحفاظ على الكفاءات واستقرار الفرق.' },
    { title: 'الهيكل والتوصيف الوظيفي', desc: 'بناء هياكل تنظيمية مرنة وتفصيل المهام والصلاحيات بدقة تمنع التداخل وتحقق التميز الإداري.' },
    { title: 'الدعم والمساندة التشغيلية', desc: 'توفير غطاء إداري وقانوني متكامل لشؤون الموظفين (رواتب، إجازات، تأمين) بدون أي تعقيدات.' }
  ];

  return (
    <>
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(15px, -25px) rotate(8deg); }
            66% { transform: translate(-10px, -45px) rotate(-5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes float-reverse {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-20px, -30px) rotate(-8deg); }
            66% { transform: translate(15px, -50px) rotate(5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          @keyframes glow-pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); filter: blur(40px); }
            50% { opacity: 0.7; transform: scale(1.1); filter: blur(60px); }
          }
          @keyframes slide-up-fade {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          .animate-float { animation: float 14s ease-in-out infinite; }
          .animate-float-reverse { animation: float-reverse 16s ease-in-out infinite; }
          .animate-glow-pulse { animation: glow-pulse 8s ease-in-out infinite alternate; }
          
          .luxury-card {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(201, 165, 90, 0.15);
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
          }
        `}
      </style>

      <div className="relative min-h-screen bg-[#faf9f6] pt-28 pb-20 overflow-hidden font-sans" dir="rtl">
        <FloatingIcons />

        <div 
          className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8"
          style={{
            animation: isLoaded ? 'slide-up-fade 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
            opacity: 0
          }}
        >
          {/* Top Bar Navigation */}
          <div className="mb-10">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-gray-100 hover:border-[#c9a55a] text-[#8a6d2c] font-bold text-sm shadow-sm hover:shadow transition transform hover:-translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              الرجوع للرئيسية
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-[#c9a55a]/10 rounded-2xl mb-4 border border-[#c9a55a]/20">
              <Users className="w-10 h-10 text-[#c9a55a]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              إدارة الموارد البشرية وتطوير الكفاءات
            </h1>
            <p className="text-xl text-[#8a6d2c] font-medium opacity-90 mb-6">
              بناء فرق عمل استثنائية ومحترفة تمثل واجهة راقية لضيافة تفوق التوقعات
            </p>
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent mx-auto"></div>
          </div>

          {/* Description Block */}
          <div className="luxury-card rounded-[2.5rem] p-8 md:p-12 mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a55a]/5 rounded-bl-full pointer-events-none" />
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right border-r-4 border-[#c9a55a] pr-4">
                رأس مالنا البشري وسر تميزنا
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed text-justify mb-6">
                إن العامل الحاسم والأكثر تأثيراً في جودة وضيافة أي منشأة فندقية هو العامل البشري. نحن في لامار بارك نولي اهتماماً فائقاً بإدارة الموارد البشرية وتأهيل الكوادر، حيث نعمل على استقطاب وتعيين أفضل المحترفين في قطاع الفنادق محلياً وعالمياً، وندعم بقوة برامج السعودة والتمكين الوطني لبناء جيل رائد من قادة الضيافة السعوديين.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed text-justify">
                برامجنا التدريبية المكثفة والمنهجية لا تغطي فقط المهارات العملية للتشغيل والخدمة، بل تركز بشكل أساسي على مهارات التواصل، وحل المشكلات ورعاية النزلاء بلطف ومهنية. نحن نطور للشركات هياكل إدارية واضحة ونطبق أنظمة متطورة لقياس الأداء وربط الإنتاجية بالمكافآت، لنصنع بيئة عمل متناغمة ومستقرة تحقق ولاء الموظفين واندفاعهم للتميز اليومي.
              </p>
            </div>
          </div>

          {/* Main Pillars Grid */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              الركائز الأساسية للموارد البشرية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pillars.map((pillar, index) => (
                <div 
                  key={index}
                  className="luxury-card rounded-3xl p-8 hover:border-[#c9a55a]/40 transition transform hover:-translate-y-2 hover:shadow-xl duration-300 relative group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#c9a55a]/10 text-[#c9a55a] flex items-center justify-center font-extrabold text-xl mb-5 group-hover:bg-[#c9a55a] group-hover:text-white transition-colors duration-300">
                    {index + 1}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Inquiry Form Section */}
          <div className="max-w-3xl mx-auto">
            <div className="luxury-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-[#c9a55a]/30 shadow-2xl">
              <div className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-[#c9a55a]/5 rounded-full pointer-events-none blur-xl" />
              
              <div className="text-center mb-8 relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">استشارات وحلول توظيف لعقارك</h3>
                <p className="text-[#8a6d2c] font-medium text-sm md:text-base">
                  هل تواجه مشاكل في توظيف الكفاءات الفندقية أو إدارة شؤون طاقمك؟ تواصل مع مستشاري الموارد البشرية لدينا.
                </p>
              </div>

              {formSubmitted ? (
                <div className="text-center py-10 relative z-10 animate-fade-in">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200 shadow-sm animate-bounce">
                    <ShieldCheck className="w-10 h-10 text-green-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">تم إرسال طلبك بنجاح!</h4>
                  <p className="text-gray-600 mb-6">لقد تلقينا طلب الاستشارة بنجاح. سيقوم مستشار التوظيف وتطوير الكفاءات لدينا بالتواصل معك قريباً.</p>
                  <button 
                    onClick={() => setFormSubmitted(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#c9a55a] to-[#DfB86c] text-white rounded-full font-bold shadow-md hover:brightness-110 transition"
                  >
                    تقديم طلب جديد
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم المالك / الجهة</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="الاسم الثلاثي"
                        className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/40 focus:border-[#c9a55a] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="05xxxxxxx"
                        className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/40 focus:border-[#c9a55a] transition text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم العقار / المنشأة</label>
                      <input 
                        type="text" 
                        value={formData.propertyName}
                        onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                        placeholder="مثال: فندق لامار بارك"
                        className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/40 focus:border-[#c9a55a] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نوع العقار</label>
                      <select 
                        value={formData.propertyType}
                        onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                        className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/40 focus:border-[#c9a55a] transition"
                      >
                        <option value="hotel">فندق</option>
                        <option value="resort">منتجع</option>
                        <option value="chalet">شاليهات</option>
                        <option value="apartments">شقق فندقية</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">موقع المنشأة</label>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="مثال: الرياض"
                      className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/40 focus:border-[#c9a55a] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ما هي طبيعة المشاكل أو الاحتياجات الخاصة بطاقم العمل؟</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="تحدث معنا عن رغبتك بالتوظيف أو التدريب أو إعادة الهيكلة الوظيفية..."
                      className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/40 focus:border-[#c9a55a] transition resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#c9a55a] to-[#DfB86c] hover:brightness-110 text-white rounded-xl font-bold shadow-lg shadow-[#c9a55a]/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>طلب استشارة توظيف وإدارية</span>
                    <Send className="w-4 h-4 group-hover:translate-x-[-4px] group-hover:translate-y-[-2px] transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default HRManagement;
