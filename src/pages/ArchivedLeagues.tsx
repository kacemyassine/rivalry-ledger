import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ArchivedLeagues = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210_70%_10%)] via-[hsl(200_60%_15%)] to-[hsl(180_50%_8%)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(180_80%_50%)] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(200_80%_40%)] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-7xl mb-6">📚</div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[hsl(180_80%_50%)] via-[hsl(45_85%_55%)] to-[hsl(180_80%_50%)] bg-clip-text text-transparent">
              Archived Leagues
            </h1>
            <p className="text-xl text-[hsl(180_20%_65%)] leading-relaxed">
              Your completed league seasons will appear here once they're archived
            </p>
          </div>

          {/* Illustration */}
          <div className="py-12">
            <div className="bg-gradient-to-br from-[hsl(210_45%_12%)] to-[hsl(200_40%_18%)] rounded-2xl border border-[hsl(200_40%_25%)] p-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-[hsl(180_30%_95%)] text-lg font-semibold mb-2">
                No archived leagues yet
              </p>
              <p className="text-[hsl(180_20%_65%)]">
                Complete and archive a season to see it in your historical records
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-8">
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[hsl(180_80%_50%)] to-[hsl(45_85%_55%)] hover:from-[hsl(180_90%_60%)] hover:to-[hsl(45_95%_65%)] text-[hsl(210_70%_10%)] font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 text-lg"
            >
              ← Back to Current League
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivedLeagues;
