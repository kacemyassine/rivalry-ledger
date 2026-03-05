import { useNavigate } from 'react-router-dom';

const Cups = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0800] relative overflow-hidden">

      {/* Animated star field */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Gold/amber glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-yellow-800 opacity-15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-orange-900 opacity-15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-900 opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">

        {/* Header */}
        <div className="text-center mb-16">

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
            <span className="text-amber-500 text-lg">✦</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>

          <p className="text-amber-600/70 uppercase tracking-[0.4em] text-xs font-semibold mb-3">
            Glory Awaits
          </p>

          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700">
              Cups &
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-300 via-orange-500 to-orange-800">
              Tournaments
            </span>
          </h1>

          <p className="text-amber-300/40 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Where legends are made and champions are crowned.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <span className="text-amber-500 text-sm">🏆</span>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>
        </div>

        {/* Empty state card */}
        <div className="relative w-full max-w-2xl group">

          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-3xl opacity-20 group-hover:opacity-40 blur-md transition-all duration-500" />

          <div className="relative bg-gradient-to-br from-[#1f1508] via-[#150f04] to-[#0f0800] rounded-3xl border border-amber-500/20 p-14 text-center shadow-2xl">

            {/* Trophy icon with glow */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-amber-400 opacity-20 blur-2xl rounded-full scale-150" />
              <span className="relative text-7xl">🏆</span>
            </div>

            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-3">
              No Cups Available Yet
            </h2>

            <p className="text-amber-300/40 text-sm leading-relaxed max-w-sm mx-auto mb-10">
              Tournament brackets and special cup competitions will appear here once they're created. Check back soon!
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
              <span className="text-amber-600/50 text-xs">🎖️</span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
            </div>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0f0800] font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/25 text-sm"
            >
              ← Back to Current League
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cups;