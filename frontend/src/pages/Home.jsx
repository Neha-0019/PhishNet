import React, { useState } from 'react';
import { Search, Activity, Shield, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import ResultCard from '../components/ResultCard';

function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/predict', { url });
      setResult(response.data);
    } catch (err) {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-100">
          Protect yourself from <span className="text-red-500">phishing</span>
        </h1>
        <p className="text-xl text-slate-400">
          Paste a suspicious URL below. Our AI ensemble model analyzes 20 distinct features in real-time to detect threats.
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex items-center space-x-3">
        <form onSubmit={handlePredict} className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="url"
            required
            placeholder="https://example.com/login"
            className="block w-full pl-12 pr-36 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-2xl transition-all"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 rounded-xl shadow-lg transition-all flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>Scanning</span>
              </>
            ) : (
              <span>Check URL</span>
            )}
          </button>
        </form>
        {result && (
          <button 
            type="button"
            onClick={() => { setUrl(''); setResult(null); }}
            className="h-[72px] px-5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-2xl text-blue-400 hover:text-blue-300 transition-all shadow-lg flex items-center justify-center animate-in fade-in"
            title="New Scan"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-500/30 rounded-full animate-ping absolute inset-0"></div>
              <div className="w-24 h-24 border-4 border-t-blue-500 border-slate-700 rounded-full animate-spin flex items-center justify-center bg-slate-800">
                <Shield className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <p className="text-blue-400 font-medium animate-pulse">Running ensemble models...</p>
          </div>
        )}

        {!loading && result && (
          <ResultCard result={result} />
        )}
      </div>
    </div>
  );
}

export default Home;
