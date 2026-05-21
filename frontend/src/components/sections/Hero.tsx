import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Hotel, Palmtree } from 'lucide-react';

const Hero = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // اختيار ID الفيديو المناسب: موبايل (YouTube Short) أو كمبيوتر
  const videoId = isMobile ? 'lV9SkFRQ6Kg' : 'TShpHlJ5tvE';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div 
			className="relative overflow-hidden h-[calc(100vh-3.5rem)]"
    >
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full"
          src={embedUrl}
          title="Hero Background Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={
            isMobile
              ? {
                  pointerEvents: 'none',
                  border: 'none',
                  height: '100vh',
                  width: '56.25vh',
                  minWidth: '100vw',
                  minHeight: '177.78vw',
                }
              : {
                  pointerEvents: 'none',
                  border: 'none',
                  width: '100vw',
                  height: '56.25vw',
                  minHeight: '100%',
                  minWidth: '177.78vh',
                }
          }
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/45"></div>

			{/* Decorative brand glows */}
			<div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#DfB86c] opacity-10 blur-3xl z-10"></div>
			<div className="pointer-events-none absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#c9a55a] opacity-10 blur-3xl z-10"></div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white max-w-5xl px-4 animate-fade-in-up">
          {/* Glassmorphic Luxury Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-xl select-none">
            <span className="text-[#DfB86c] text-sm animate-pulse">⚜️</span>
            <span className="text-xs md:text-sm font-semibold tracking-wider text-[#DfB86c]">
              تجربة استثنائية من الرفاهية والفخامة
            </span>
          </div>

          {/* Fancy Title */}
          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-normal text-white drop-shadow-2xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fcf5e9] to-[#DfB86c] py-2">
              اكتشف أفضل الفنادق والشاليهات الفاخرة
            </span>
            <span className="block text-xl md:text-2xl font-light text-gray-200 mt-4 relative after:content-[''] after:block after:w-32 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-[#DfB86c] after:to-transparent after:mx-auto after:mt-5 opacity-90">
              في المملكة العربية السعودية
            </span>
          </h1>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10">
						<Link
							to="/hotels"
							className="group relative inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 min-w-[200px] font-bold text-lg text-[#1a1102] shadow-2xl transition duration-500 overflow-hidden bg-gradient-to-r from-[#DfB86c] via-[#ffebd2] to-[#c9a55a] hover:brightness-110 hover:shadow-[0_20px_40px_-15px_rgba(201,165,90,0.45)] transform hover:scale-[1.02] luxury-sheen-btn"
						>
							<Hotel className="h-5 w-5 text-[#1a1102] transition-transform duration-500 group-hover:scale-110" />
							<span>حجز الفنادق الفاخرة</span>
							<span className="absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 bg-gradient-to-r from-[#DfB86c] to-[#c9a55a]" aria-hidden="true"></span>
						</Link>

						<Link
							to="/resorts"
							className="group relative inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 min-w-[200px] font-bold text-lg text-white shadow-2xl transition duration-500 overflow-hidden border border-white/20 hover:border-[#DfB86c]/80 bg-white/5 backdrop-blur-md hover:bg-[#DfB86c]/20 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] transform hover:scale-[1.02]"
						>
							<Palmtree className="h-5 w-5 text-[#DfB86c] transition-transform duration-500 group-hover:scale-110 group-hover:text-white" />
							<span>حجز الشاليهات الراقية</span>
							<span className="absolute -inset-0.5 rounded-2xl blur opacity-10 group-hover:opacity-20 bg-white" aria-hidden="true"></span>
						</Link>
          </div>
        </div>
      </div>

      {/* Light Architectural Polygon Divider */}
      <div className="absolute bottom-[-2px] left-0 right-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[55px] md:h-[95px] text-white fill-current"
        >
          <defs>
            <linearGradient id="gold-grad-poly" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DfB86c" />
              <stop offset="30%" stopColor="#ffebd2" />
              <stop offset="70%" stopColor="#c9a55a" />
              <stop offset="100%" stopColor="#DfB86c" />
            </linearGradient>
          </defs>
          
          {/* Glowing background stroke for a neon-like luxury effect */}
          <path 
            d="M0,70 L500,50 L700,80 L1200,40" 
            fill="none" 
            stroke="url(#gold-grad-poly)" 
            strokeWidth="5.5"
            strokeOpacity="0.4"
            className="blur-[4px]"
          />

          {/* Crisp, glowing golden line */}
          <path 
            d="M0,70 L500,50 L700,80 L1200,40" 
            fill="none" 
            stroke="url(#gold-grad-poly)" 
            strokeWidth="3.5"
            className="drop-shadow-[0_2px_8px_rgba(201,165,90,0.8)]"
          />

          {/* Pure White Faceted Mask to blend with the next section */}
          <path 
            d="M0,71 L500,51 L700,81 L1200,41 L1200,120 L0,120 Z" 
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Animated Vertical Scroll Down Indicator - PURELY VISUAL */}
      <div 
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center cursor-pointer text-gray-800 hover:text-[#c9a55a] transition-all hover:scale-110"
        onClick={() => window.scrollTo({ top: window.innerHeight - 56, behavior: 'smooth' })}
        aria-label="Scroll Down"
      >
        <div className="w-[28px] h-[44px] rounded-full border-2 border-[#c9a55a]/80 flex justify-center p-1.5 shadow-xl bg-white/90 backdrop-blur-[6px] hover:border-[#DfB86c]">
          <div className="w-[4px] h-[8px] bg-[#c9a55a] rounded-full scroll-down-dot" />
        </div>
      </div>
    </div>
  );
};

export default Hero;