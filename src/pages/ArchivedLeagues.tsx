import { useNavigate } from 'react-router-dom';

const archivedLeagues = [
  {
    id: 'cosmus-league',
    name: 'Cosmus League',
    startDate: 'Dec 4, 2025',
    endDate: 'Mar 2, 2026',
    winner: 'Harbor United',
    matches: 50,
    description: 'The inaugural season of the Cosmus League. An epic battle between Ocean Dragon and Harbor United across 50 intense matches.',
    image: '/images/cosmusleague.png',
  },
];

const ArchivedLeagues = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08060f] relative overflow-hidden">

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

      {/* Purple glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-purple-900 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-indigo-900 opacity-20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-900 opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-yellow-500/60" />
            <span className="text-yellow-500 text-lg">✦</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-yellow-500/60" />
          </div>

          <p className="text-purple-400 uppercase tracking-[0.4em] text-xs font-semibold mb-3">
            Hall of Fame
          </p>

          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700">
              Archived
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-300 via-purple-500 to-purple-800">
              Leagues
            </span>
          </h1>

          <p className="text-purple-300/50 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Every season tells a story. Every champion leaves a legacy.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <span className="text-purple-500 text-sm">🏛️</span>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-8 max-w-3xl mx-auto">
          {archivedLeagues.map((league) => (
            <div
              key={league.id}
              onClick={() => navigate(`/archived-leagues/${league.id}`)}
              className="group cursor-pointer relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-purple-600 to-yellow-500 rounded-3xl opacity-20 group-hover:opacity-60 blur-md transition-all duration-500" />

              <div className="relative flex flex-col sm:flex-row bg-gradient-to-br from-[#1a1428] via-[#120f1f] to-[#0d0b18] rounded-3xl border border-purple-500/30 group-hover:border-yellow-500/50 overflow-hidden transition-all duration-300 shadow-2xl">

                <div className="w-full sm:w-[35%] shrink-0 overflow-hidden relative bg-[#0d0b18]">
                  {league.image ? (
                    <>
                      <img
                        src={league.image}
                        alt={league.name}
                        className="w-full h-auto sm:h-full object-contain sm:object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120f1f] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#1a1428]" />
                    </>
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-6xl bg-purple-900/20">🏆</div>
                  )}
                </div>

                <div className="flex-1 p-7 flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <span className="inline-block text-xs uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                      ⚽ Completed Season
                    </span>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 group-hover:from-yellow-100 group-hover:to-yellow-400 transition-all">
                      {league.name}
                    </h2>
                    <p className="text-purple-300/50 text-sm leading-relaxed">
                      {league.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-400">{league.matches}</p>
                      <p className="text-purple-400/50 text-xs uppercase tracking-wider mt-1">Matches</p>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
                    <div>
                      <p className="text-xl font-bold text-yellow-300">{league.winner}</p>
                      <p className="text-purple-400/50 text-xs uppercase tracking-wider mt-1">Champion 🏆</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-purple-500/10 pt-4">
                    <div className="flex gap-3 text-xs text-purple-400/50">
                      <span>📅 {league.startDate}</span>
                      <span>→</span>
                      <span>🏁 {league.endDate}</span>
                    </div>
                    <span className="text-xs text-yellow-500/70 group-hover:text-yellow-400 transition-colors font-medium">
                      View Season →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back button — inside container, after cards */}
        <div className="flex justify-center mt-16 max-w-3xl mx-auto">
          <div className="relative group/btn">
            {/* Button glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-xl opacity-0 group-hover/btn:opacity-50 blur transition-all duration-300" />
            <button
              onClick={() => navigate('/')}
              className="relative inline-flex items-center gap-3 bg-[#120f1f] hover:bg-[#1a1428] text-purple-300 hover:text-yellow-300 border border-purple-500/30 hover:border-yellow-500/40 font-medium py-3 px-10 rounded-xl transition-all duration-300 hover:scale-105 text-sm tracking-wide"
            >
              <span className="text-base">←</span>
              Back to Current League
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchivedLeagues;