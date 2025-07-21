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
    <div className="flex flex-col items-center justify-center mb-8 p-6 rounded-2xl backdrop-blur-sm bg-black/30" style={{ color: 'white' }}>
      <div className="text-center space-y-3">
        <h1 style={{ color: 'white', fontSize: '4rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          Vala Hua-Hin
        </h1>
        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '300', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', marginTop: '0.5rem' }}>
          Nu Chapter Hotel
        </h2>
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mt-4 mx-auto"></div>
        <p style={{ color: 'white', fontSize: '1rem', opacity: 0.9, marginTop: '1rem', textAlign: 'center', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          ระบบบำรุงรักษาโรงแรม | Hotel Maintenance System
        </p>
      </div>
    </div>
  );
}