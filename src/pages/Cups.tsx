import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGitHubData } from '@/hooks/useGitHubData';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Cups = () => {
  const navigate = useNavigate();
  const { fetchCups, updateCups, uploadImage } = useGitHubData();
  const { isAdmin } = useAdmin();
  const [cups, setCups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [cupName, setCupName] = useState('');
  const [cupWinner, setCupWinner] = useState('');
  const [cupDate, setCupDate] = useState('');
  const [cupImage, setCupImage] = useState<string | null>(null);
  const [cupImageFile, setCupImageFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchCups();
      if (data) setCups(data.cups);
      setLoading(false);
    };
    load();
  }, [fetchCups]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCupImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCupImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddCup = async () => {
    if (!cupName.trim()) return;
    setSaving(true);

    let imagePath: string | null = null;
    if (cupImageFile && cupImage) {
      const filename = `${cupName.trim().replace(/\s+/g, '-').toLowerCase()}-cup.${cupImageFile.name.split('.').pop()}`;
      imagePath = await uploadImage(cupImage, filename);
    }

    const newCup = {
      id: `cup-${Date.now()}`,
      name: cupName.trim(),
      winner: cupWinner.trim(),
      date: cupDate,
      image: imagePath,
      matches: [],
    };

    const updatedCups = [...cups, newCup];
    const success = await updateCups({ cups: updatedCups });
    if (success) {
      setCups(updatedCups);
      setCupName('');
      setCupWinner('');
      setCupDate('');
      setCupImage(null);
      setCupImageFile(null);
      setShowForm(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0f0800]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

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

      <div className="relative z-10 container mx-auto px-4 py-24">

        {/* Header */}
        <div className="text-center mb-20">
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

          {/* Admin add button */}
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mt-8 inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-semibold py-2 px-6 rounded-xl transition-all duration-300 text-sm"
            >
              {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Cup</>}
            </button>
          )}
        </div>

        {/* Add Cup Form */}
        {isAdmin && showForm && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-3xl opacity-20 blur-md" />
              <div className="relative bg-gradient-to-br from-[#1f1508] via-[#150f04] to-[#0f0800] rounded-3xl border border-amber-500/20 p-8 space-y-5">
                <h3 className="text-xl font-bold text-amber-400">New Cup</h3>

                {/* Image upload */}
                <div className="flex flex-col items-center gap-3">
                  {cupImage && (
                    <img src={cupImage} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-amber-500/20" />
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <span className="flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 border border-amber-400/20 hover:border-amber-400/40 bg-amber-400/10 px-4 py-2 rounded-lg transition-all">
                      <Upload className="w-4 h-4" />
                      {cupImageFile ? cupImageFile.name : 'Select Image'}
                    </span>
                  </label>
                </div>

                <div className="space-y-1">
                  <Label className="text-amber-200/80 text-sm">Cup Name</Label>
                  <Input
                    value={cupName}
                    onChange={(e) => setCupName(e.target.value)}
                    placeholder="e.g. Ramadan Cup 2026"
                    className="bg-[#0f0800] border-amber-400/20 text-amber-100 placeholder:text-amber-200/20"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-amber-200/80 text-sm">Winner</Label>
                  <Input
                    value={cupWinner}
                    onChange={(e) => setCupWinner(e.target.value)}
                    placeholder="e.g. Harbor United"
                    className="bg-[#0f0800] border-amber-400/20 text-amber-100 placeholder:text-amber-200/20"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-amber-200/80 text-sm">Date</Label>
                  <Input
                    type="date"
                    value={cupDate}
                    onChange={(e) => setCupDate(e.target.value)}
                    className="bg-[#0f0800] border-amber-400/20 text-amber-100"
                  />
                </div>

                <Button
                  onClick={handleAddCup}
                  disabled={saving || !cupName.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-[#0f0800] font-bold"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Cup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="flex flex-col gap-8 max-w-3xl mx-auto">
          {cups.length === 0 ? (
            <div className="relative w-full group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-3xl opacity-20 group-hover:opacity-40 blur-md transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-[#1f1508] via-[#150f04] to-[#0f0800] rounded-3xl border border-amber-500/20 p-14 text-center shadow-2xl">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-amber-400 opacity-20 blur-2xl rounded-full scale-150" />
                  <span className="relative text-7xl">🏆</span>
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-3">
                  No Cups Available Yet
                </h2>
                <p className="text-amber-300/40 text-sm leading-relaxed max-w-sm mx-auto">
                  Tournament brackets and special cup competitions will appear here once they're created.
                </p>
              </div>
            </div>
          ) : (
            cups.map((cup) => (
              <div
                key={cup.id}
                onClick={() => navigate(`/cups/${cup.id}`)}
                className="group cursor-pointer relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-3xl opacity-20 group-hover:opacity-60 blur-md transition-all duration-500" />

                <div className="relative flex flex-col sm:flex-row bg-gradient-to-br from-[#1f1508] via-[#150f04] to-[#0f0800] rounded-3xl border border-amber-500/30 group-hover:border-amber-500/50 overflow-hidden transition-all duration-300 shadow-2xl">

                  {/* Image */}
                  <div className="w-full sm:w-[35%] shrink-0 overflow-hidden relative bg-[#0f0800]">
                    {cup.image ? (
                      <>
                        <img
                          src={cup.image}
                          alt={cup.name}
                          className="w-full h-auto sm:h-full object-contain sm:object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#150f04] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#1f1508]" />
                      </>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-6xl bg-amber-900/20">🏆</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-7 flex flex-col justify-between gap-5">
                    <div className="space-y-2">
                      <span className="inline-block text-xs uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        ⚽ Cup Competition
                      </span>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 group-hover:from-amber-100 group-hover:to-amber-400 transition-all">
                        {cup.name}
                      </h2>

                      {/* Teams */}
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-orange-300 font-semibold text-sm">Ocean Dragon</span>
                        <span className="text-amber-600/60 font-bold text-xs px-2 py-0.5 border border-amber-600/30 rounded-full">VS</span>
                        <span className="text-orange-300 font-semibold text-sm">Harbor United</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xl font-bold text-amber-300">{cup.winner || '—'}</p>
                        <p className="text-amber-500/50 text-xs uppercase tracking-wider mt-1">Champion 🏆</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-amber-500/10 pt-4">
                      <span className="text-xs text-amber-500/50">📅 {cup.date || '—'}</span>
                      <span className="text-xs text-amber-500/70 group-hover:text-amber-400 transition-colors font-medium">
                        View Cup →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-16 max-w-3xl mx-auto">
          <div className="relative group/btn">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl opacity-0 group-hover/btn:opacity-50 blur transition-all duration-300" />
            <button
              onClick={() => navigate('/')}
              className="relative inline-flex items-center gap-3 bg-[#150f04] hover:bg-[#1f1508] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/40 font-medium py-3 px-10 rounded-xl transition-all duration-300 hover:scale-105 text-sm tracking-wide"
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

export default Cups;