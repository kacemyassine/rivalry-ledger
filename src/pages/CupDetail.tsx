import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGitHubData } from '@/hooks/useGitHubData';
import { Loader2 } from 'lucide-react';

const CupDetail = () => {
  const { cupId } = useParams();
  const navigate = useNavigate();
  const { fetchCups } = useGitHubData();
  const [cup, setCup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchCups();
      if (data) {
        const found = data.cups.find((c: any) => c.id === cupId);
        setCup(found || null);
      }
      setLoading(false);
    };
    load();
  }, [cupId, fetchCups]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#0f0800]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!cup) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0f0800] gap-4">
        <p className="text-amber-400/50 text-lg">Cup not found.</p>
        <button onClick={() => navigate('/cups')} className="text-amber-400 text-sm underline">
          Back to Cups
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0800] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-amber-400">{cup.name}</h1>
        <p className="text-amber-300/50 text-sm">Content coming soon...</p>
        <button onClick={() => navigate('/cups')} className="text-amber-400 text-sm underline">
          Back to Cups
        </button>
      </div>
    </div>
  );
};

export default CupDetail;