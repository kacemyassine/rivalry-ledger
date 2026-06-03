import { useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { User, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/ImageLightbox';

interface TopScorersProps {
  onEditPlayer?: (playerId: string) => void;
  hideButtons?: boolean;
  theme?: 'default' | 'ramadan';
}

export function TopScorers({ onEditPlayer, hideButtons = false, theme = 'default' }: TopScorersProps) {
  const { players = [], teams = [], deletePlayer, updatePlayerImage } = useLeagueStore();
  const isRamadan = theme === 'ramadan';
  const [showAll, setShowAll] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; teamId: string; playerId: string } | null>(null);

  const sortedPlayers = [...players].sort((a: any, b: any) => (b.goals || 0) - (a.goals || 0));
  const getTeam = (teamId: string) => teams.find((t: any) => t.id === teamId);

  const scorers = sortedPlayers.filter((p: any) => (p.goals || 0) > 0);
  const nonScorers = sortedPlayers.filter((p: any) => (p.goals || 0) === 0);
  const visiblePlayers = showAll ? sortedPlayers : scorers;

  return (
    <div
      className={cn(
        'p-4 md:p-6 animate-fade-in rounded-2xl border',
        isRamadan
          ? 'bg-gradient-to-br from-[#0d1133] to-[#0a0e2a] border-yellow-400/20 shadow-[0_0_30px_rgba(234,179,8,0.05)]'
          : 'atlantis-card'
      )}
      style={{ animationDelay: '0.2s' }}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        {isRamadan && <span className="text-yellow-400">⚽</span>}
        <h2 className={cn(
          'text-xl md:text-2xl font-display font-semibold',
          isRamadan
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500'
            : 'glow-text text-primary'
        )}>
          Top Scorers
        </h2>
        {isRamadan && <span className="text-yellow-400">⚽</span>}
      </div>

      {sortedPlayers.length === 0 ? (
        <p className={cn('text-center py-8 text-sm md:text-base', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>
          No players added yet. Add players to track their goals!
        </p>
      ) : (
        <div className="space-y-2 md:space-y-3 overflow-x-auto scroll-container -mx-4 md:mx-0 px-4 md:px-0">
          <div className="min-w-[320px]">
            {visiblePlayers.map((player: any, index: number) => {
              const team = getTeam(player.teamId);
              const isTopThree = index < 3;
              const teamPlayers = players.filter((p: any) => p.teamId === player.teamId);
              const canDelete = player.goals === 0 && teamPlayers.length > 23;

              return (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg transition-all mb-2',
                    isRamadan
                      ? cn('hover:bg-yellow-400/5', isTopThree && 'bg-yellow-400/10')
                      : cn('hover:bg-muted/30', isTopThree && 'bg-muted/20')
                  )}
                >
                  {/* Rank badge */}
                  <div className={cn(
                    'w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shrink-0',
                    index === 0 && (isRamadan ? 'bg-yellow-400 text-[#0a0e2a]' : 'bg-gold text-primary-foreground'),
                    index === 1 && 'bg-gray-400 text-primary-foreground',
                    index === 2 && 'bg-amber-700 text-primary-foreground',
                    index > 2 && (isRamadan ? 'bg-yellow-400/10 text-yellow-200/50' : 'bg-muted text-muted-foreground')
                  )}>
                    {index + 1}
                  </div>

                  {/* Player image */}
                  <div className={cn(
                    'w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 shrink-0 bg-muted',
                    isRamadan ? 'border-yellow-400/30' : 'border-border'
                  )}>
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setLightboxImage({
                          src: player.fullImage || '',
                          alt: player.name,
                          teamId: player.teamId,
                          playerId: player.id,
                        })}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center cursor-pointer"
                        onClick={() => setLightboxImage({
                          src: '',
                          alt: player.name,
                          teamId: player.teamId,
                          playerId: player.id,
                        })}
                      >
                        <User className={cn('w-5 h-5 md:w-6 md:h-6', isRamadan ? 'text-yellow-400/50' : 'text-muted-foreground')} />
                      </div>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold truncate text-sm md:text-base', isRamadan ? 'text-yellow-100' : '')}>
                      {player.name}
                    </p>
                    <p className={cn(
                      'text-xs md:text-sm',
                      isRamadan ? player.teamId === 'team1' ? 'text-cyan-400' : 'text-yellow-400' : player.teamId === 'team1' ? 'text-primary' : 'text-secondary'
                    )}>
                      {team?.name}
                    </p>
                  </div>

                  {/* Goals */}
                  <div className="text-right shrink-0">
                    <p className={cn('text-xl md:text-2xl font-bold', isRamadan ? 'text-yellow-400' : 'text-gold')}>
                      {player.goals || 0}
                    </p>
                    <p className={cn('text-xs', isRamadan ? 'text-yellow-200/40' : 'text-muted-foreground')}>goals</p>
                  </div>

                  {/* Buttons */}
                  {!hideButtons && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-7 w-7 md:h-8 md:w-8', isRamadan ? 'text-yellow-200/50 hover:text-yellow-400' : 'text-muted-foreground hover:text-primary')}
                        onClick={() => onEditPlayer?.(player.id)}
                      >
                        <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <div
                        title={
                          player.goals > 0
                            ? 'Cannot delete a player with goals'
                            : teamPlayers.length <= 23
                            ? 'Squad must have more than 23 players'
                            : 'Delete player'
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => deletePlayer(player.id)}
                          disabled={!canDelete}
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show all / Show less button */}
            {nonScorers.length > 0 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  'w-full mt-3 py-2 text-sm flex items-center justify-center gap-2 rounded-lg transition-all',
                  isRamadan
                    ? 'text-purple-100/50 hover:text-yellow-400 hover:bg-yellow-400/5'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted/20'
                )}
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4" /> Show less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Show all players ({nonScorers.length} with 0 goals)</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
          uploadPath={lightboxImage.teamId === 'team1'
            ? 'images/HarborUnitedPlayers/fullImages'
            : 'images/OceanDragonPlayers/fullImages'}
          onUpload={(path) => updatePlayerImage(lightboxImage.playerId, path)}
        />
      )}
    </div>
  );
}