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
    image: '/images/e_005768.png',
  },
];

const ArchivedLeagues = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210_70%_10%)] via-[hsl(200_60%_15%)] to-[hsl(180_50%_8%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(180_80%_50%)] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(200_80%_40%)] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-4">📚</div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[hsl(180_80%_50%)] via-[hsl(45_85%_55%)] to-[hsl(180_80%_50%)] bg-clip-text text-transparent mb-3">
            Archived Leagues
          </h1>
          <p className="text-base md:text-xl text-[hsl(180_20%_65%)]">
            Browse completed league seasons and relive the history
          </p>
        </div>

        {/* League Cards */}
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          {archivedLeagues.map((league) => (
            <div
              key={league.id}
              onClick={() => navigate(`/archived-leagues/${league.id}`)}
              className="cursor-pointer flex flex-col sm:flex-row bg-gradient-to-br from-[hsl(210_45%_12%)] to-[hsl(200_40%_18%)] rounded-2xl border border-[hsl(200_40%_25%)] overflow-hidden hover:border-[hsl(180_80%_50%)] hover:scale-[1.02] transition-all duration-300 group"
            >
              {/* Image */}
              <div className="w-full h-48 sm:w-[30%] sm:h-auto shrink-0 overflow-hidden bg-[hsl(210_50%_8%)]">
                {league.image ? (
                  <img
                    src={league.image}
                    alt={league.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🏆</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-6 flex flex-col gap-3">

                <h2 className="text-xl font-bold text-[hsl(180_30%_95%)] group-hover:text-[hsl(180_80%_50%)] transition-colors">
                  {league.name}
                </h2>

                <p className="text-[hsl(180_20%_65%)] text-sm leading-relaxed line-clamp-2">
                  {league.description}
                </p>

                <div className="flex gap-1 text-sm">
                  <span className="text-[hsl(180_20%_65%)]">📅</span>
                  <span className="text-[hsl(180_30%_95%)] font-semibold">{league.startDate}</span>
                  <span className="text-[hsl(180_20%_65%)]">→</span>
                  <span className="text-[hsl(180_30%_95%)] font-semibold">{league.endDate}</span>
                </div>

                <div className="flex gap-2 text-sm">
                  <span className="text-[hsl(180_20%_65%)]">🏆 Winner:</span>
                  <span className="text-[hsl(45_85%_55%)] font-semibold">{league.winner}</span>
                </div>

                <div className="flex gap-2 text-sm">
                  <span className="text-[hsl(180_20%_65%)]">⚽ Matches:</span>
                  <span className="text-[hsl(180_80%_50%)] font-semibold">{league.matches}</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchivedLeagues;