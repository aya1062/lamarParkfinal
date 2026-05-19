import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
        <div className="text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            مرحباً بك في 
            <img
              src="/lamar/logo بدون خلفية.png"
              alt="لامار بارك"
              className="mx-auto mt-8 h-36 md:h-36 w-auto drop-shadow-lg"
            />
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90">
            اكتشف أفضل الفنادق والشاليهات الفاخرة في المملكة العربية السعودية
          </p>

					{/* Search Bar */}
					<form onSubmit={handleSearch} className="relative max-w-xl mx-auto w-full mb-10">
						<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
							<Search className="h-6 w-6 text-gray-400" />
						</div>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="ابحث عن الفنادق، الشاليهات، الوجهات..."
							className="w-full input-rtl py-4 pr-12 pl-24 rounded-full border-none shadow-2xl text-lg text-gray-900 focus:ring-4 focus:ring-[#DfB86c]/50 outline-none"
						/>
						<button 
							type="submit"
							className="absolute left-2 top-2 bottom-2 px-6 bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white rounded-full font-semibold hover:brightness-110 transition shadow-md luxury-pulse-btn"
						>
							بحث
						</button>
					</form>
 
					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
						<Link
							to="/hotels"
						className="group relative inline-flex items-center justify-center rounded-xl px-6 py-2 min-w-[150px] font-semibold text-lg bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white shadow-xl transition transform hover:translate-y-[-1px] hover:brightness-110 hover:ring-2 hover:ring-[#DfB86c]/50 focus:outline-none"
						>
							<span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition bg-white"></span>
							<span className="relative z-10">حجز فندق</span>
						<span className="absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-50 bg-gradient-to-r from-[#DfB86c] to-[#c9a55a]" aria-hidden="true"></span>
						</Link>

						<Link
							to="/resorts"
						className="group relative inline-flex items-center justify-center rounded-xl px-8 py-2 min-w-[150px] font-semibold text-lg bg-white text-black shadow-xl border border-white/80 transition transform hover:translate-y-[-1px] hover:bg-[#DfB86c]/5 hover:ring-2 hover:ring-[#DfB86c]/50 focus:outline-none"
						>
							<span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition bg-black"></span>
							<span className="relative z-10">حجز شالية</span>
							<span className="absolute -inset-0.5 rounded-xl blur opacity-10 group-hover:opacity-20 bg-white" aria-hidden="true"></span>
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