import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <img 
                src="/lamar/new logo.png" 
                alt="لامار بارك" 
                className="h-8 w-8 object-contain"
                width={32}
                height={32}
                decoding="async"
                loading="lazy"
              />
              <span className="text-2xl font-bold">لامار بارك</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              منصة رائدة في حجز الفنادق والشاليهات الفاخرة في المملكة العربية السعودية. نوفر لك تجربة استثنائية وخدمة متميزة.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gold">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-gold transition-colors duration-300">الرئيسية</a></li>
              <li><a href="/chalets" className="text-gray-300 hover:text-gold transition-colors duration-300">الشاليهات</a></li>
              <li><a href="/hotels" className="text-gray-300 hover:text-gold transition-colors duration-300">الفنادق</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-gold transition-colors duration-300">من نحن</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-gold transition-colors duration-300">تواصل معنا</a></li>
              <li><a href="/policies" className="text-gray-300 hover:text-gold transition-colors duration-300">سياسة الحجز والإلغاء</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gold">معلومات التواصل</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-5 w-5 text-gold" />
                <span className="text-gray-300">+966558248265</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Mail className="h-5 w-5 text-gold" />
                <span className="text-gray-300">info@lamarpark.sa</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-gold" />
                <span className="text-gray-300">الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gold">تابعنا</h3>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gold transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gold transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gold transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              تابع آخر العروض والأخبار على وسائل التواصل الاجتماعي
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            جميع الحقوق محفوظة © 2024 لمار بارك. تم التصميم بـ ❤️ للمملكة العربية السعودية
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;