// Use uploads path for background image
const regentBgImage = '/uploads/regent-bg.png';

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
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/30" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function HotelLogo() {
  return (
    <div className="flex flex-col items-center justify-center text-white mb-8 p-6 rounded-2xl backdrop-blur-sm bg-black/20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-shadow-lg bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
          The Regent
        </h1>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-light tracking-wider opacity-90 mt-2">
          Cha Am Beach Resort
        </h2>
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mt-4 mx-auto"></div>
        <p className="text-sm md:text-base opacity-80 mt-4 text-center max-w-md">
          ระบบบำรุงรักษาโรงแรม | Hotel Maintenance System
        </p>
      </div>
    </div>
  );
}