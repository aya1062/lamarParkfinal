import React from 'react';
import { Newspaper, Globe, Monitor, Tv, TrendingUp, Trophy, Radio, ChevronLeft } from 'lucide-react';

interface LinkItem {
  name: string;
  url: string;
  en?: boolean;
}

interface Category {
  title: string;
  icon: React.ReactNode;
  links: LinkItem[];
}

const categories: Category[] = [
  {
    title: 'صحف ومواقع الأخبار',
    icon: <Newspaper className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'عكاظ', url: 'https://www.okaz.com.sa/' },
      { name: 'الرياض', url: 'https://www.alriyadh.com/' },
      { name: 'الوطن', url: 'https://www.alwatan.com.sa/' },
      { name: 'الشرق الأوسط', url: 'https://aawsat.com/' },
      { name: 'المدينة', url: 'https://www.al-madina.com/' },
      { name: 'الجزيرة', url: 'https://www.al-jazirah.com/' },
      { name: 'اليوم', url: 'https://www.alyaum.com/' },
      { name: 'مكة', url: 'https://makkahnewspaper.com/' },
      { name: 'البلاد', url: 'https://albiladdaily.com/' },
      { name: 'أم القرى', url: 'https://www.uqn.gov.sa/' },
    ],
  },
  {
    title: 'الصحف الإنجليزية',
    icon: <Globe className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'Arab News', url: 'https://www.arabnews.com/', en: true },
      { name: 'Saudi Gazette', url: 'https://saudigazette.com.sa/', en: true },
      { name: 'Al Arabiya English', url: 'https://english.alarabiya.net', en: true },
      { name: 'Asharq Al-Awsat English', url: 'https://english.aawsat.com', en: true },
      { name: 'SPA English', url: 'https://www.spa.gov.sa/en', en: true },
    ],
  },
  {
    title: 'المواقع الإخبارية والبوابات',
    icon: <Monitor className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'سبق', url: 'https://sabq.org/' },
      { name: 'المرصد', url: 'https://al-marsd.com/' },
      { name: 'المواطن', url: 'https://www.almowaten.net/' },
      { name: 'صدى', url: 'https://slaati.com/' },
      { name: 'الوئام', url: 'https://www.alweeam.com.sa/' },
      { name: 'الجزيرة أونلاين', url: 'https://www.al-jazirahonline.com/' },
      { name: 'Sauress', url: 'https://www.sauress.com/', en: true },
      { name: 'باب', url: 'https://bab.com/' },
      { name: 'أخبارية عفيف', url: 'http://www.afifnp.com/' },
      { name: 'جوجل أخبار', url: 'https://news.google.com/home?hl=ar&gl=SA&ceid=SA:ar' },
    ],
  },
  {
    title: 'القنوات التلفزيونية ووسائل الإعلام',
    icon: <Tv className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'العربية', url: 'https://www.alarabiya.net/' },
      { name: 'الحدث', url: 'https://www.alhadath.net/' },
      { name: 'إيلاف', url: 'https://elaph.com/' },
      { name: 'سيدتي', url: 'https://www.sayidaty.net/' },
      { name: 'الجميلة', url: 'https://www.aljamila.com/' },
      { name: 'Ra2ed', url: 'https://www.ra2ed.com/', en: true },
    ],
  },
  {
    title: 'أخبار الأعمال والاقتصاد',
    icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'الاقتصادية', url: 'https://www.aleqt.com/' },
      { name: 'زاوية - الأعمال', url: 'https://www.zawya.com/ar/%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84' },
    ],
  },
  {
    title: 'الأخبار الرياضية',
    icon: <Trophy className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'الرياضية', url: 'https://arriyadiyah.com/' },
      { name: 'Goal Arabic', url: 'https://www.goal.com/ar-sa', en: true },
      { name: 'Kooora', url: 'https://www.kooora.com/', en: true },
    ],
  },
  {
    title: 'وكالات الأنباء والإعلام الرسمي',
    icon: <Radio className="w-5 h-5 md:w-6 md:h-6 text-[#c9a55a]" />,
    links: [
      { name: 'وكالة الأنباء السعودية', url: 'https://www.spa.gov.sa/' },
      { name: 'SPA English', url: 'https://www.spa.gov.sa/en', en: true },
    ],
  },
];

const DigitalNewspapers = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-12 md:pb-20" dir="rtl">
      {/* Header Section */}
      <div className="relative h-[30vh] min-h-[260px] md:h-[40vh] md:min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="relative z-20 text-center px-4 w-full max-w-4xl mx-auto pt-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg leading-tight">
            الصحف الإلكترونية
          </h1>
          <p className="text-sm md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md px-2 leading-relaxed">
            دليلك الشامل لأهم الصحف والمواقع الإخبارية المحلية والعالمية
          </p>
          <div className="w-16 md:w-24 h-1 bg-[#c9a55a] mx-auto mt-6 md:mt-8 rounded-full shadow-lg" />
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg md:shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 md:hover:shadow-2xl md:hover:shadow-[#c9a55a]/10 transition-all duration-300 md:hover:-translate-y-1 flex flex-col"
            >
              <div className="p-4 md:p-6 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50 flex items-center gap-3 md:gap-4">
                <div className="p-2.5 md:p-3 bg-[#c9a55a]/10 rounded-xl shrink-0">
                  {category.icon}
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">{category.title}</h2>
              </div>
              <div className="p-4 md:p-6 flex-grow bg-gray-50/30 md:bg-transparent">
                <ul className="space-y-2.5 md:space-y-3">
                  {category.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-3 md:p-3 rounded-xl bg-white md:bg-transparent border border-gray-100 md:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm md:shadow-none md:hover:border-gray-100"
                        lang={link.en ? "en" : "ar"}
                        dir={link.en ? "ltr" : "rtl"}
                      >
                        <span className={`text-[15px] md:text-base text-gray-700 md:text-gray-600 group-hover:text-[#c9a55a] font-medium transition-colors ${link.en ? 'font-sans' : ''}`}>
                          {link.name}
                        </span>
                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-50 md:bg-white shadow-none md:shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-[#c9a55a]/30 group-hover:bg-[#c9a55a]/5 transition-all shrink-0 ${link.en ? 'rotate-180 ml-3' : 'mr-3'}`}>
                          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-[#c9a55a] transition-colors" />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalNewspapers;
