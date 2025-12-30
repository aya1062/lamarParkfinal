import React from 'react';

const FloatingWhatsApp: React.FC = () => {
  const whatsappNumber = '+966558248265';
  const phoneNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const message = 'مرحباً، أرغب في الاستفسار عن خدماتكم';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // تتبع التحويل عند النقر على زر الواتساب
    if (window.gtag_report_conversion) {
      window.gtag_report_conversion(whatsappUrl);
      e.preventDefault();
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 group"
      aria-label="تواصل معنا عبر الواتساب"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.78 11.78 0 0 0 12.03 0C5.48 0 .16 5.33.16 11.9c0 2.09.55 4.13 1.6 5.93L0 24l6.33-1.72a11.86 11.86 0 0 0 5.7 1.46h.01c6.55 0 11.87-5.33 11.87-11.9 0-3.18-1.24-6.17-3.39-8.36ZM12.04 21.3h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.75 1.02 1-3.66-.22-.38a9.3 9.3 0 0 1-1.4-4.86c0-5.16 4.19-9.36 9.37-9.36 2.5 0 4.86.98 6.64 2.76a9.34 9.34 0 0 1 2.74 6.63c0 5.16-4.2 9.4-9.43 9.4Zm5.4-7.02c-.3-.16-1.78-.88-2.06-.98-.28-.1-.49-.15-.7.15-.2.3-.8.98-.97 1.18-.18.2-.36.22-.66.06-.3-.16-1.26-.46-2.4-1.47-.89-.79-1.5-1.76-1.67-2.06-.18-.3-.02-.46.13-.6.13-.12.3-.32.46-.48.16-.16.2-.28.3-.48.1-.2.05-.36-.03-.5-.08-.16-.7-1.68-.96-2.3-.25-.6-.5-.52-.7-.53l-.6-.01c-.2 0-.5.07-.76.36-.26.3-1 1-1 2.44 0 1.44 1.03 2.83 1.18 3.02.15.2 2.03 3.17 4.92 4.44.69.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.78-.73 2.03-1.44.25-.7.25-1.32.18-1.44-.07-.12-.27-.2-.57-.36Z" />
      </svg>
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        تواصل معنا عبر الواتساب
      </span>
    </a>
  );
};

export default FloatingWhatsApp;


