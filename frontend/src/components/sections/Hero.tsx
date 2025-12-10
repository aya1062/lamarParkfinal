import { Link } from 'react-router-dom';

const Hero = () => {
  // استخراج ID الفيديو من الرابط (YouTube Shorts)
  const videoId = 'LzIFAQWieOw';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div 
			className="relative overflow-hidden h-[calc(100vh-3.5rem)]"
    >
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto"
          src={embedUrl}
          title="Hero Background Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{
            pointerEvents: 'none',
            border: 'none',
            width: '100vw',
            height: '56.25vw',
            minHeight: '100%',
            minWidth: '177.78vh'
          }}
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
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            اكتشف أفضل الفنادق والشاليهات الفاخرة في المملكة العربية السعودية
          </p>

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
    </div>
  );
};

export default Hero;