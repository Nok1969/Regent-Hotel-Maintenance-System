import regentBgImage from "@assets/regent-hotel-bg.png";

interface HotelBackgroundProps {
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
}

export function HotelBackground({ children, className = "", overlay = true }: HotelBackgroundProps) {
  return (
    <div 
      className={`relative min-h-screen ${className}`}
      style={{
        backgroundImage: `url(${regentBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function HotelLogo() {
  return (
    <div className="flex flex-col items-center justify-center text-white mb-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-shadow-lg">
        The Regent
      </h1>
      <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-wider opacity-90 mt-2">
        Cha Am Beach Resort
      </h2>
      <div className="w-32 h-0.5 bg-white/60 mt-4"></div>
      <p className="text-sm md:text-base opacity-80 mt-4 text-center max-w-md">
        ระบบบำรุงรักษาโรงแรม | Hotel Maintenance System
      </p>
    </div>
  );
}