import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    // Check if we already showed the splash screen in this session
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    if (!isVisible) return;

    // Start fading out after 3.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3500);

    // Completely remove from DOM after 4.3 seconds
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 4300);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white ${isFadingOut ? 'animate-splash-fade-out' : ''}`}
    >
      <div className="flex flex-col items-center justify-center relative w-full px-6">
        {/* Logo Container */}
        <div className="animate-splash-logo mb-8">
          <img 
            src="/lamar/new logo.png" 
            alt="لامار بارك" 
            className="w-48 md:w-64 h-auto object-contain drop-shadow-sm"
          />
        </div>
        
        {/* Text Container */}
        <div className="animate-splash-text text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide font-amiri">
            حيث تلتقي الفخامة بالطبيعة
          </h1>
          <div className="mt-4 w-12 h-1 bg-gold rounded-full mx-auto opacity-80" />
        </div>
      </div>
      
      {/* Decorative background elements (optional, very subtle) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-light/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
    </div>
  );
};

export default SplashScreen;
