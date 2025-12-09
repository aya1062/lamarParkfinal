import { Phone, Mail, MapPin, Instagram } from 'lucide-react';

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
                <span className="text-gray-300">Info@lamarparks.com</span>
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
            <div className="flex space-x-3 space-x-reverse">
              <a
                href="https://www.instagram.com/lamarpark_resort?igsh=dnEyZW55dXUydWw2"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gold transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@lamarpark.sa?_r=1&_t=ZS-924mA9OH4ya"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gold transition-colors duration-300"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M220.8 86.6c-20.7-6.2-38.2-20.3-48.8-39.6-3.3-6-5.7-12.2-7.4-18.8h-33.1l.2 129c-.5 12.9-11 23.2-24 23.2-13.2 0-24-10.8-24-24.1 0-13.2 10.8-24 24-24 2.4 0 4.6.3 6.8.9V103c-2.2-.3-4.5-.4-6.8-.4-31.3 0-56.8 25.5-56.8 56.8 0 31.3 25.5 56.8 56.8 56.8 31.1 0 56.4-25.2 56.8-56.3l-.1-82c12.3 12.4 28.7 21.4 47.2 24.4V86.6z" />
                </svg>
              </a>
              <a
                href="https://snapchat.com/t/Z9GZLxoC"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gold transition-colors duration-300"
                aria-label="Snapchat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M255.1 32c-74.6 0-135 60.4-135 135v38.5c0 10.4-2.5 20.7-7.3 29.9-13.8 26.4-37.4 38.8-54.5 44.9-8.8 3.2-14.5 11.6-14.1 20.9.4 9.3 6.8 17.2 16 19.4 6.7 1.6 14 3.2 22.1 4.6 5.2.9 8.9 5.9 8.1 11.1-.9 6.5-2.1 12.9-3.5 19.3-1.6 7.2-3.3 14.6-5.2 21.8-1.6 6.1.6 12.6 5.7 16.6 10.2 8 24.1 8.3 32 .8l15.2-13.4c6.4-5.7 15.8-6.6 23.3-2.2 23.6 13.8 49.4 21.8 77.1 21.8s53.5-8 77.1-21.8c7.5-4.4 16.9-3.5 23.3 2.2l15.2 13.4c7.9 7 21.8 6.7 32-.8 5.1-4 7.3-10.5 5.7-16.6-1.9-7.2-3.6-14.6-5.2-21.8-1.4-6.4-2.6-12.8-3.5-19.3-.8-5.2 2.9-10.2 8.1-11.1 8.1-1.4 15.4-3 22.1-4.6 9.2-2.2 15.6-10.1 16-19.4.4-9.3-5.3-17.7-14.1-20.9-17.1-6.1-40.7-18.5-54.5-44.9-4.8-9.2-7.3-19.5-7.3-29.9V167c0-74.6-60.4-135-135-135z"/>
                </svg>
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              تابع آخر العروض والأخبار على وسائل التواصل الاجتماعي
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            جميع الحقوق محفوظة © 2024 لامار بارك. تم التصميم بـ ❤️ للمملكة العربية السعودية
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;