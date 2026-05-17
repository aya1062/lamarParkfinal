import React, { useState, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, Maximize2, X, Coffee, Utensils, ChefHat, Sparkles, Leaf } from 'lucide-react';

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background radial gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] bg-gradient-radial from-[#c9a55a]/10 to-transparent opacity-80 animate-glow-pulse" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[150vw] h-[150vw] md:w-[80vw] md:h-[80vw] bg-gradient-radial from-[#e8d5a5]/15 to-transparent opacity-70 animate-glow-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-gradient-radial from-white/40 to-transparent blur-3xl opacity-60 animate-glow-pulse" style={{ animationDelay: '4s' }} />

      {/* Floating elegant outline icons */}
      <div className="absolute top-[15%] left-[5%] animate-float text-[#c9a55a] opacity-20">
        <Coffee strokeWidth={1} className="w-14 h-14 md:w-20 md:h-20" />
      </div>
      <div className="absolute top-[35%] right-[8%] animate-float-reverse text-[#c9a55a] opacity-20" style={{ animationDelay: '1s' }}>
        <Utensils strokeWidth={1} className="w-16 h-16 md:w-24 md:h-24" />
      </div>
      <div className="absolute top-[60%] left-[10%] animate-float text-[#c9a55a] opacity-20" style={{ animationDelay: '2.5s' }}>
        <ChefHat strokeWidth={1} className="w-12 h-12 md:w-16 md:h-16" />
      </div>
      <div className="absolute bottom-[20%] right-[15%] animate-float-reverse text-[#c9a55a] opacity-20" style={{ animationDelay: '3.5s' }}>
        <Leaf strokeWidth={1} className="w-14 h-14 md:w-20 md:h-20" />
      </div>
      <div className="absolute top-[45%] left-[80%] animate-float text-[#c9a55a] opacity-30" style={{ animationDelay: '0.5s' }}>
        <Sparkles strokeWidth={1} className="w-8 h-8 md:w-12 md:h-12" />
      </div>
      <div className="absolute top-[80%] left-[30%] animate-float text-[#c9a55a] opacity-30" style={{ animationDelay: '4s' }}>
        <Sparkles strokeWidth={1} className="w-10 h-10 md:w-14 md:h-14" />
      </div>
      
      {/* Sparkle Particles */}
      {Array.from({ length: 8 }).map((_, i) => (
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

const Minibar = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Entrance animation trigger
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    // Prevent background scrolling when fullscreen
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/lamar/MENU.png';
    link.download = 'Lamar_Minibar_Menu.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  };

  const toggleZoom = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

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
          @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          
          .animate-float { animation: float 14s ease-in-out infinite; }
          .animate-float-reverse { animation: float-reverse 16s ease-in-out infinite; }
          .animate-glow-pulse { animation: glow-pulse 8s ease-in-out infinite alternate; }
          
          .glass-btn {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(201, 165, 90, 0.5);
            box-shadow: 0 10px 30px -10px rgba(201, 165, 90, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          }
          .glass-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent);
            background-size: 200% 100%;
            border-radius: inherit;
            animation: shimmer 4s infinite linear;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .glass-btn:hover::before { opacity: 1; }
          
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          .bg-gradient-radial {
            background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
          }
        `}
      </style>

      {/* Main Experience Container */}
      <div className="relative min-h-[100dvh] bg-[#fbfaf8] flex flex-col items-center justify-center overflow-hidden font-sans pb-10 pt-16 md:pt-24" dir="rtl">
        
        <FloatingIcons />

        {/* Content Wrapper */}
        <div 
          className="relative z-10 w-full flex flex-col items-center justify-center flex-grow"
          style={{
            animation: isLoaded ? 'slide-up-fade 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
            opacity: 0
          }}
        >
          {/* Title Area */}
          <div className="text-center mb-6 md:mb-8 z-20">
            <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] text-[#b59045] mb-2 font-serif uppercase drop-shadow-sm">Minibar</h1>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-l from-[#c9a55a] to-transparent"></div>
              <span className="text-[#c9a55a] text-sm md:text-base tracking-widest uppercase font-medium">Menu Collection</span>
              <div className="w-12 h-[1px] bg-gradient-to-r from-[#c9a55a] to-transparent"></div>
            </div>
          </div>

          {/* Hero Menu Card Container */}
          <div 
            className="relative w-[75vw] max-w-[320px] md:max-w-[360px] cursor-pointer group flex items-center justify-center perspective-1000 mx-auto my-2 md:my-6" 
            onClick={toggleFullscreen}
          >
            {/* Real Layered Depth */}
            {/* Layer 3 - Deepest */}
            <div className="absolute inset-x-6 inset-y-0 bg-[#c9a55a]/10 rounded-[2rem] transform translate-y-8 rotate-6 scale-90 transition-all duration-700 group-hover:translate-y-10 group-hover:rotate-8 blur-md"></div>
            
            {/* Layer 2 - Middle */}
            <div className="absolute inset-x-3 inset-y-0 bg-[#fff] rounded-[2rem] transform translate-y-4 rotate-3 scale-95 transition-all duration-700 group-hover:translate-y-6 group-hover:rotate-4 shadow-xl shadow-[#c9a55a]/20 border border-[#c9a55a]/20 opacity-90 backdrop-blur-md"></div>
            
            {/* Layer 1 - Close */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-[2rem] transform -rotate-1 scale-[1.02] transition-all duration-700 group-hover:-rotate-2 group-hover:scale-[1.03] shadow-2xl shadow-black/10 border border-white/50"></div>

            {/* Main Hero Card */}
            <div className="relative w-full bg-white rounded-[2rem] p-2 md:p-3 shadow-[0_20px_50px_-12px_rgba(201,165,90,0.3)] transform transition-all duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2 border border-[#c9a55a]/30 z-10 flex flex-col">
              <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-[#fdfcfb]">
                {/* Dynamic Lighting Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#c9a55a]/0 via-white/50 to-[#c9a55a]/20 pointer-events-none z-10 transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
                <img 
                  src="/lamar/MENU.png" 
                  alt="Lamar Minibar Menu" 
                  className="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-[1.03] transform-origin-center block"
                />
              </div>
            </div>
            
            {/* Interactive Pulse Hint */}
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl shadow-[#c9a55a]/50 animate-pulse">
                <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Premium Glassmorphism Buttons */}
          <div className="flex items-center gap-4 md:gap-6 mt-10 md:mt-12 z-20">
            <button 
              onClick={handleDownload}
              className="relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 glass-btn rounded-full text-[#8a6d2c] hover:text-[#5c4719] transition-all duration-500 transform hover:-translate-y-1 group"
            >
              <Download className="w-5 h-5 relative z-10" />
              <span className="text-sm md:text-base font-bold tracking-wide relative z-10">تحميل القائمة</span>
            </button>
            <button 
              onClick={toggleFullscreen}
              className="relative overflow-hidden w-14 h-14 flex items-center justify-center glass-btn rounded-full text-[#8a6d2c] hover:text-[#5c4719] transition-all duration-500 transform hover:-translate-y-1 group"
              aria-label="عرض بملء الشاشة"
            >
              <Maximize2 className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>
      </div>

      {/* Cinematic Fullscreen Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-[#0a0a0a]/95 backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFullscreen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {isFullscreen && (
          <>
            {/* Top Navigation Bar */}
            <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <button 
                onClick={toggleFullscreen}
                className="p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full text-white transition-all duration-300 transform hover:scale-105"
              >
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              
              <div className="flex gap-3 md:gap-4">
                <button 
                  onClick={toggleZoom}
                  className="p-3 md:p-4 bg-[#c9a55a]/20 hover:bg-[#c9a55a]/30 border border-[#c9a55a]/30 backdrop-blur-md rounded-full text-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(201,165,90,0.3)]"
                >
                  {isZoomed ? <ZoomOut className="w-6 h-6 md:w-8 md:h-8" /> : <ZoomIn className="w-6 h-6 md:w-8 md:h-8" />}
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full text-white transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>
            </div>

            {/* Interactive Immersive Viewer */}
            <div 
              className="w-full h-full overflow-auto hide-scrollbar relative flex items-start justify-center pt-28 pb-20 px-4 md:px-10"
              onClick={toggleZoom}
            >
              <div 
                className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top ${
                  isZoomed ? 'w-[250%] sm:w-[180%] md:w-[120%] cursor-zoom-out pb-32' : 'w-full max-w-2xl cursor-zoom-in mt-4 md:mt-10'
                }`}
              >
                <img 
                  src="/lamar/MENU.png" 
                  alt="Minibar Menu Fullscreen" 
                  className="w-full h-auto rounded-2xl shadow-[0_30px_100px_rgba(201,165,90,0.2)] border border-[#c9a55a]/20"
                />
              </div>
            </div>
            
            {/* Subtle Zoom Hint */}
            {!isZoomed && (
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/60 text-sm tracking-widest flex items-center gap-3 pointer-events-none bg-black/40 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md animate-pulse">
                <ZoomIn className="w-5 h-5" />
                <span>انقر للتكبير</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Minibar;
