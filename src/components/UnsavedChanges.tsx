import { useState, useEffect } from 'react';
import { Save, ChevronUp, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface UnsavedChangesProps {
  changeLog: string[];
  onSave: () => void;
  saving: boolean;
  hasChanges: boolean;
}


export function UnsavedChanges({ changeLog, onSave, saving, hasChanges }: UnsavedChangesProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

  if (!hasChanges) return null;
  

  return (
    <>
      {/* Desktop — fixed top right */}
      <div className="hidden md:flex fixed top-6 right-6 z-50 flex-col items-end gap-2 max-w-sm">
        <div className="bg-[#0d1133] border border-yellow-400/30 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.1)] overflow-hidden w-full">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-yellow-400/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-yellow-400 font-semibold text-sm flex-1">
              {changeLog.length} Unsaved Change{changeLog.length > 1 ? 's' : ''}
            </span>
            <Button
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold h-7 px-3 text-xs"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" /> Save</>}
            </Button>
          </div>

          {/* Change log */}
          <div className="max-h-48 overflow-y-auto px-4 py-2 space-y-1">
            {changeLog.map((entry, i) => (
              <p key={i} className="text-xs text-yellow-200/60 py-1 border-b border-yellow-400/10 last:border-0">
                • {entry}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile — sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#0d1133] border-t border-yellow-400/30 shadow-[0_-4px_20px_rgba(234,179,8,0.1)]">
          {/* Expanded change log */}
          {expanded && (
            <div className="max-h-48 overflow-y-auto px-4 py-2 space-y-1 border-b border-yellow-400/20">
              {changeLog.map((entry, i) => (
                <p key={i} className="text-xs text-yellow-200/60 py-1 border-b border-yellow-400/10 last:border-0">
                  • {entry}
                </p>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center gap-3 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 flex items-center gap-2 text-left"
            >
              <span className="text-yellow-400 font-semibold text-sm">
                {changeLog.length} Unsaved Change{changeLog.length > 1 ? 's' : ''}
              </span>
              {expanded
                ? <ChevronDown className="w-4 h-4 text-yellow-400/60" />
                : <ChevronUp className="w-4 h-4 text-yellow-400/60" />
              }
            </button>
            <Button
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold h-8 px-4 text-xs shrink-0"
            >
              {saving
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <><Save className="w-3 h-3 mr-1" /> Save</>
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}