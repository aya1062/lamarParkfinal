import React, { useEffect, useRef, useState } from 'react';
import { Shield, Award, Clock, HeartHandshake, Sparkles } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

// Sub-component for individual card with Intersection Observer reveal
interface ScrollRevealCardProps {
  children: React.ReactNode;
  className?: string;
  index: number;
  onVisible: (index: number, visible: boolean) => void;
}

const ScrollRevealCard: React.FC<ScrollRevealCardProps> = ({ 
  children, 
  className = '', 
  index, 
  onVisible 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible(index, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px' // Trigger slightly before entering screen on mobile
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [index, onVisible]);

  // Alternate slide direction on desktop, slide up on mobile
  const slideClass = index % 2 === 0 
    ? 'md:translate-x-12' 
    : 'md:-translate-x-12';

  return (
    <div
      ref={elementRef}
      className={`${className} transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100' 
          : `opacity-0 translate-y-12 ${slideClass} scale-95 pointer-events-none`
      }`}
    >
      {React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<any>, { isVisible }) 
        : children}
    </div>
  );
};

// Sub-component for Card Content
interface FeatureCardContentProps {
  feature: Feature;
  index: number;
  isVisible?: boolean;
}

const FeatureCardContent: React.FC<FeatureCardContentProps> = ({ 
  feature, 
  index, 
  isVisible = false 
}) => {
  const Icon = feature.icon;

  // Custom responsive luxury animation class for each icon
  const getIconAnimationClass = () => {
    if (!isVisible) return 'rotate-0 opacity-40 scale-75';
    
    switch (index) {
      case 0:
        return ''; // Shield manages its own inner path loop drawing animations
      case 1:
        return 'animate-award-float';
      case 2:
        return 'animate-clock-spin';
      case 3:
        return ''; // Handshake manages its own inner paths animations
      default:
        return 'rotate-[360deg]';
    }
  };

  return (
    <div 
      className={`relative bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border transition-all duration-500 overflow-hidden group ${
        isVisible 
          ? 'border-gold/30 shadow-[0_15px_40px_rgba(201,165,90,0.12)]' 
          : 'border-gray-100 shadow-md'
      } hover:border-gold/50 hover:shadow-[0_20px_50px_rgba(201,165,90,0.18)] hover:-translate-y-1`}
    >
      {/* Light sweep hover shimmer */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer-sweep duration-1000 pointer-events-none" />

      <div className="flex items-start gap-4 md:gap-6 flex-row">
        {/* Animated Icon Circle */}
        <div className="relative flex-shrink-0">
          <div 
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-700 ${
              isVisible 
                ? 'bg-gold bg-opacity-20 scale-100' 
                : 'bg-gray-100 scale-90'
            } group-hover:bg-gold group-hover:bg-opacity-35`}
          >
            {index === 0 ? (
              <AnimatedShield 
                isVisible={isVisible} 
                className="h-7 w-7 md:h-8 md:w-8 text-gold" 
              />
            ) : index === 3 ? (
              <AnimatedHeartHandshake 
                isVisible={isVisible} 
                className="h-7 w-7 md:h-8 md:w-8 text-gold" 
              />
            ) : (
              <Icon 
                className={`h-7 w-7 md:h-8 md:w-8 text-gold transition-all duration-[1200ms] ease-out ${getIconAnimationClass()}`} 
              />
            )}
          </div>
          {/* Pulse ring when revealed */}
          {isVisible && (
            <div className="absolute inset-0 rounded-full border border-gold/40 animate-ping opacity-20" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 text-right">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 transition-colors duration-300 group-hover:text-gold">
            {feature.title}
          </h3>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Timeline Node
interface TimelineNodeProps {
  index: number;
  isVisible?: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ index, isVisible = false }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing Glow Ring */}
      <div 
        className={`absolute w-8 h-8 rounded-full border transition-all duration-700 ease-out ${
          isVisible 
            ? 'border-gold/40 bg-gold/10 scale-125 opacity-100' 
            : 'border-transparent bg-transparent scale-50 opacity-0'
        }`}
      />
      
      {/* Outer Circle */}
      <div 
        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
          isVisible 
            ? 'border-[#c9a55a] bg-white scale-110 shadow-[0_0_10px_rgba(201,165,90,0.5)]' 
            : 'border-gray-200 bg-white scale-90'
        }`}
      >
        {/* Inner Solid Circle */}
        <div 
          className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isVisible ? 'bg-[#c9a55a]' : 'bg-gray-300'
          }`}
        />
      </div>
    </div>
  );
};

// Sub-component for custom animated Heart Handshake SVG
interface AnimatedHeartHandshakeProps {
  isVisible: boolean;
  className?: string;
}

const AnimatedHeartHandshake: React.FC<AnimatedHeartHandshakeProps> = ({ isVisible, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`${className} ${isVisible ? 'revealed' : ''}`}
      style={{ overflow: 'visible' }}
    >
      {/* Handshake line */}
      <path 
        d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.96" 
        className="handshake-line"
      />
      <path d="m18 15-2-2" className="hand-crease-1" />
      <path d="m15 18-2-2" className="hand-crease-2" />
      
      {/* Outer Heart boundary - draws itself after hands shake */}
      <path 
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" 
        className="heart-outline"
      />
    </svg>
  );
};

// Sub-component for custom animated Shield SVG (with drawing loop at regular intervals)
interface AnimatedShieldProps {
  isVisible: boolean;
  className?: string;
}

const AnimatedShield: React.FC<AnimatedShieldProps> = ({ isVisible, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`${className} ${isVisible ? 'revealed' : ''}`}
      style={{ overflow: 'visible' }}
    >
      <path 
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
        className="shield-outline-path"
      />
    </svg>
  );
};

const AboutSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});

  const handleCardVisibility = (index: number, visible: boolean) => {
    if (visible) {
      setVisibleCards(prev => ({ ...prev, [index]: true }));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const containerTop = rect.top;
      const containerHeight = rect.height;
      
      // Start growing when container top enters 80% of screen height
      const startOffset = windowHeight * 0.8;
      // Complete growing when container bottom is 20% from screen bottom
      const totalDist = containerHeight;
      const currentDist = -(containerTop - startOffset);
      
      let percentage = (currentDist / totalDist) * 100;
      percentage = Math.min(100, Math.max(0, percentage));
      
      setLineHeight(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Call once to initialize positions
    const timer = setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

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
    <section 
      ref={containerRef}
      className="py-12 md:py-24 bg-transparent relative overflow-hidden"
    >
      {/* Self-contained CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-sweep {
          animation: shimmer-sweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        /* Custom Shield drawing loop animation at spaced intervals */
        .shield-outline-path {
          transform-origin: 12px 12px;
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
        }
        .revealed .shield-outline-path {
          animation: shield-draw-loop 6s ease-in-out infinite;
        }

        @keyframes shield-draw-loop {
          0% {
            stroke-dashoffset: 80;
            opacity: 0;
            transform: scale(0.9);
          }
          /* Butter-smooth slower drawing completion */
          22% {
            stroke-dashoffset: 0;
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(201, 165, 90, 0));
          }
          /* Gentle pulse while holding active */
          48% {
            stroke-dashoffset: 0;
            opacity: 1;
            transform: scale(1.08);
            filter: drop-shadow(0 0 6px rgba(201, 165, 90, 0.45));
          }
          72% {
            stroke-dashoffset: 0;
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(201, 165, 90, 0));
          }
          /* Quick dissolve/undraw */
          84% {
            stroke-dashoffset: -80;
            opacity: 0;
            transform: scale(0.95);
          }
          /* Rest period (remains invisible before repeating) */
          100% {
            stroke-dashoffset: 80;
            opacity: 0;
            transform: scale(0.9);
          }
        }

        /* Award Floating Animation */
        @keyframes award-float {
          0%, 100% { transform: translateY(0) rotate(360deg); }
          50% { transform: translateY(-4px) rotate(363deg); }
        }
        .animate-award-float {
          animation: award-float 4s ease-in-out infinite;
        }

        /* Clock Spinning Animation (Slightly faster clock speed) */
        @keyframes clock-spin {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(720deg); }
        }
        .animate-clock-spin {
          animation: clock-spin 7.5s linear infinite;
        }

        /* Custom Coordinated Heart Handshake SVG Loop (7s infinite) */
        .handshake-line {
          transform-origin: 12px 12px;
          opacity: 0;
        }
        .revealed .handshake-line {
          animation: handshake-line-loop 7s ease-in-out infinite;
        }

        .hand-crease-1 {
          transform-origin: 17px 14px;
          opacity: 0;
        }
        .revealed .hand-crease-1 {
          animation: crease-1-loop 7s ease-in-out infinite;
        }

        .hand-crease-2 {
          transform-origin: 14px 17px;
          opacity: 0;
        }
        .revealed .hand-crease-2 {
          animation: crease-2-loop 7s ease-in-out infinite;
        }

        .heart-outline {
          transform-origin: 12px 12px;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          opacity: 0;
        }
        .revealed .heart-outline {
          animation: heart-outline-loop 7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes handshake-line-loop {
          0% { opacity: 0; transform: translateY(10px) scale(0.6); }
          8% { opacity: 1; transform: translateY(0) scale(1); }
          8%, 75% { opacity: 1; }
          /* Hand squeezes */
          20%, 50% { transform: translateY(0) scale(1.08); }
          35%, 65% { transform: translateY(0) scale(1); }
          75% { opacity: 1; transform: translateY(0) scale(1); }
          84% { opacity: 0; transform: translateY(10px) scale(0.6); }
          100% { opacity: 0; transform: translateY(10px) scale(0.6); }
        }

        @keyframes crease-1-loop {
          0% { opacity: 0; transform: translate(5px, -5px) scale(0.5); }
          12% { opacity: 1; transform: translate(0, 0) scale(1); }
          12%, 75% { opacity: 1; transform: translate(0, 0) scale(1); }
          84% { opacity: 0; transform: translate(5px, -5px) scale(0.5); }
          100% { opacity: 0; transform: translate(5px, -5px) scale(0.5); }
        }

        @keyframes crease-2-loop {
          0% { opacity: 0; transform: translate(5px, 5px) scale(0.5); }
          12% { opacity: 1; transform: translate(0, 0) scale(1); }
          12%, 75% { opacity: 1; transform: translate(0, 0) scale(1); }
          84% { opacity: 0; transform: translate(5px, 5px) scale(0.5); }
          100% { opacity: 0; transform: translate(5px, 5px) scale(0.5); }
        }

        @keyframes heart-outline-loop {
          0%, 12% { stroke-dashoffset: 100; opacity: 0; transform: scale(1); }
          /* Drawing starts and completes */
          13% { opacity: 1; }
          38% { stroke-dashoffset: 0; opacity: 1; transform: scale(1); filter: drop-shadow(0 0 0 rgba(201, 165, 90, 0)); }
          /* Heartbeat pulses and glows */
          48%, 68% { stroke-dashoffset: 0; opacity: 1; transform: scale(1.06); filter: drop-shadow(0 0 5px rgba(201, 165, 90, 0.35)); }
          58% { stroke-dashoffset: 0; opacity: 1; transform: scale(1); filter: drop-shadow(0 0 0 rgba(201, 165, 90, 0)); }
          75% { stroke-dashoffset: 0; opacity: 1; transform: scale(1); filter: drop-shadow(0 0 0 rgba(201, 165, 90, 0)); }
          /* Undraw and fade out */
          84% { stroke-dashoffset: 100; opacity: 0; transform: scale(0.95); }
          100% { stroke-dashoffset: 100; opacity: 0; }
        }
      `}} />

      {/* Decorative luxury vector shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a55a]/5 rounded-full filter blur-3xl -mr-48 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DfB86c]/5 rounded-full filter blur-3xl -ml-48 -mb-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="flex items-center justify-center mb-6 animate-float-slow">
            <img 
              src="lamar/logo بدون خلفية.png" 
              alt="لامار بارك" 
              className="h-28 md:h-36 w-auto object-contain"
              width={420}
              height={300}
              decoding="async"
            />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-serif relative inline-block">
            لماذا تختار لامار بارك؟
            <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </h2>
          
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            نحن نقدم لك تجربة حجز مميزة مع مجموعة واسعة من أفخم الفنادق والشاليهات في المملكة العربية السعودية. 
            رحلتك تبدأ معنا بخطوة واحدة نحو الراحة والأناقة.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto px-2 md:px-0">
          
          {/* Vertical Timeline Background Track */}
          <div className="absolute right-6 md:right-1/2 md:translate-x-1/2 top-4 bottom-4 w-[2px] bg-gray-200/60 rounded-full" />
          
          {/* Vertical Timeline Active Glow Path */}
          <div 
            className="absolute right-6 md:right-1/2 md:translate-x-1/2 top-4 w-[2px] bg-gradient-to-b from-[#DfB86c] to-[#c9a55a] shadow-[0_0_8px_rgba(201,165,90,0.6)] rounded-full transition-all duration-300 ease-out" 
            style={{ height: `${lineHeight}%`, maxHeight: 'calc(100% - 32px)' }}
          />

          {/* Cards List */}
          <div className="space-y-12 md:space-y-20 relative">
            {features.map((feature, index) => {
              const isEven = index % 2 === 0;
              const isVisible = !!visibleCards[index];
              
              return (
                <div 
                  key={index} 
                  className={`flex flex-col md:flex-row ${
                    isEven ? 'md:flex-row-reverse' : ''
                  } items-start md:items-center relative w-full`}
                >
                  {/* Card Container */}
                  <div className="w-full md:w-1/2 pr-14 md:pr-0 md:px-10">
                    <ScrollRevealCard index={index} onVisible={handleCardVisibility}>
                      <FeatureCardContent feature={feature} index={index} />
                    </ScrollRevealCard>
                  </div>

                  {/* Center Node (Circle) */}
                  <div className="absolute right-6 translate-x-1/2 md:right-1/2 md:translate-x-1/2 top-5 md:top-1/2 md:-translate-y-1/2 z-20">
                    <TimelineNode index={index} isVisible={isVisible} />
                  </div>

                  {/* Desktop Spacer */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Cinematic CTA Banner */}
        <div className="relative mt-24 md:mt-36 overflow-hidden rounded-3xl group shadow-2xl">
          {/* Parallax Image Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 group-hover:scale-110"
            style={{ 
              backgroundImage: `url('lamar/hero.jpg')`,
            }}
          />
          {/* Dark luxury blur filter overlay */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />
          
          {/* Radial gold gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#c9a55a]/20 via-transparent to-transparent opacity-80" />

          {/* Banner Contents */}
          <div className="relative z-10 py-16 px-6 md:py-24 md:px-12 text-center text-white">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/20 border border-gold/40 mb-6 animate-pulse">
              <Sparkles className="h-7 w-7 text-gold animate-float-slow" />
            </div>
            
            <h3 className="text-3xl md:text-5xl font-bold mb-6 font-serif leading-tight">
              ابدأ رحلتك الفاخرة اليوم
            </h3>
            
            <p className="text-base md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              احجز إقامتك المثالية واستمتع بتجربة لا تُنسى في أروع الوجهات السياحية في المملكة العربية السعودية.
            </p>
            
            <button className="relative group/btn overflow-hidden bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_10px_30px_rgba(201,165,90,0.35)] hover:shadow-[0_15px_45px_rgba(201,165,90,0.55)] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] luxury-pulse-btn">
              {/* Animated sheen sweeping through the button */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:animate-shimmer-sweep duration-1000 pointer-events-none" />
              استكشف عروضنا الحصرية
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;