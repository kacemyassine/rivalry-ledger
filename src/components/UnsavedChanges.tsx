import { useState, useEffect } from "react";
import {
  Save,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Undo2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnsavedChangesProps {
  changeLog: string[];
  onSave: () => void;
  onUndo: (index: number) => void;
  onUndoAll: () => void;
  saving: boolean;
  hasChanges: boolean;
}

export function UnsavedChanges({
  changeLog,
  onSave,
  onUndo,
  onUndoAll,
  saving,
  hasChanges,
}: UnsavedChangesProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  if (!hasChanges) return null;

  return (
    <>
      {/* Desktop — fixed top right */}
      <div className="hidden md:flex fixed top-6 right-6 z-50 flex-col items-end gap-2 w-80">
        <div className="w-full rounded-2xl overflow-hidden border border-yellow-400/30 bg-[#0a0e2a]/95 backdrop-blur-md shadow-[0_0_40px_rgba(234,179,8,0.15)]">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-yellow-400/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-yellow-400 font-semibold text-sm flex-1">
              {changeLog.length} Unsaved Change{changeLog.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Change log */}
          <div className="max-h-48 overflow-y-auto px-2 py-2 space-y-1">
            {changeLog.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group"
              >
                <span className="text-xs text-white/60 flex-1 truncate">
                  • {entry}
                </span>
                <button
                  onClick={() => onUndo(i)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400/60 hover:text-yellow-400"
                  title="Undo this change"
                >
                  <Undo2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-yellow-400/20">
            <Button
              onClick={onUndoAll}
              disabled={saving}
              size="sm"
              variant="ghost"
              className="flex-1 text-white/50 hover:text-white hover:bg-white/10 text-xs h-8"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Undo All
            </Button>
            <Button data-testid="save-button"
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold text-xs h-8"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile — sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#0a0e2a]/98 backdrop-blur-md border-t border-yellow-400/20 shadow-[0_-4px_30px_rgba(234,179,8,0.1)]">
          {/* Expanded change log */}
          {expanded && (
            <div
              data-testid="expanded-changelog-mobile"
              className="max-h-48 overflow-y-auto px-2 py-2 space-y-1 border-b border-yellow-400/20"
            >
              {changeLog.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group"
                >
                  <span className="text-xs text-white/60 flex-1 truncate">
                    • {entry}
                  </span>
                  <button
                    onClick={() => onUndo(i)}
                    className="text-yellow-400/60 hover:text-yellow-400"
                    title="Undo this change"
                  >
                    <Undo2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center gap-2 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <button
              data-testid="expand-button"
              onClick={() => setExpanded(!expanded)}
              className="flex-1 flex items-center gap-2 text-left"
            >
              <span className="text-yellow-400 font-semibold text-sm">
                {changeLog.length} Unsaved Change
                {changeLog.length > 1 ? "s" : ""}
              </span>
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-white/40" />
              ) : (
                <ChevronUp className="w-4 h-4 text-white/40" />
              )}
            </button>
            <Button
              onClick={onUndoAll}
              disabled={saving}
              size="sm"
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/10 text-xs h-8 px-3 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button data-testid="save-button"
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#0a0e2a] font-bold h-8 px-4 text-xs shrink-0"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
