import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div 
			className="relative h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
      }}
    >
			{/* Decorative brand glows */}
			<div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#DfB86c] opacity-10 blur-3xl"></div>
			<div className="pointer-events-none absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#c9a55a] opacity-10 blur-3xl"></div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            مرحباً بك في 
            <span className="text-gold block mt-2">لمار بارك</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            اكتشف أفضل الفنادق والشاليهات الفاخرة في المملكة العربية السعودية
          </p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
						<Link
							to="/hotels"
						className="group relative inline-flex items-center justify-center rounded-xl px-10 py-5 font-semibold text-xl bg-gradient-to-r from-[#DfB86c] to-[#c9a55a] text-white shadow-xl transition transform hover:translate-y-[-1px] hover:brightness-110 hover:ring-2 hover:ring-[#DfB86c]/50 focus:outline-none"
						>
							<span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition bg-white"></span>
							<span className="relative z-10">حجز فندق</span>
						<span className="absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-50 bg-gradient-to-r from-[#DfB86c] to-[#c9a55a]" aria-hidden="true"></span>
						</Link>

						<Link
							to="/resorts"
						className="group relative inline-flex items-center justify-center rounded-xl px-10 py-5 font-semibold text-xl bg-white text-black shadow-xl border border-white/80 transition transform hover:translate-y-[-1px] hover:bg-[#DfB86c]/5 hover:ring-2 hover:ring-[#DfB86c]/50 focus:outline-none"
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