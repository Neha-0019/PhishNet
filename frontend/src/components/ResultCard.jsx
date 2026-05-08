import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Flag, MessageSquare, Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FeedbackModal from './FeedbackModal';

function ResultCard({ result }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  const isPhishing = result.is_phishing;
  const isDangerous = result.risk_level === 'Dangerous';
  const isSuspicious = result.risk_level === 'Suspicious';
  
  const colorHex = isDangerous ? '#ef4444' : isSuspicious ? '#f59e0b' : '#22c55e';
  
  const gaugeData = [{
    name: 'Confidence',
    value: result.confidence,
    fill: colorHex,
  }];

  const handleReport = async () => {
    setReporting(true);
    try {
      await api.post('/report', { url: result.url });
      toast.success('URL reported successfully.');
    } catch (error) {
      // interceptor handles toast
    } finally {
      setReporting(false);
    }
  };

  return (
    <>
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        
        <div className={`p-6 flex items-start justify-between border-b border-slate-700 ${isDangerous ? 'bg-red-900/10' : isSuspicious ? 'bg-yellow-900/10' : 'bg-emerald-900/10'}`}>
          <div className="pr-4">
            <h2 className="text-2xl font-bold text-slate-100 mb-1">Scan Complete</h2>
            <p className="text-sm text-slate-400 break-all">{result.url}</p>
          </div>
          <div className={`shrink-0 p-4 rounded-xl flex flex-col items-center justify-center border ${
            isDangerous ? 'bg-red-900/30 text-red-400 border-red-800/50' : 
            isSuspicious ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 
            'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
          }`}>
            {isPhishing ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            <span className="font-bold text-sm mt-2 tracking-wider uppercase">{result.risk_level}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col space-y-6">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex flex-col items-center justify-center relative min-h-[250px]">
              <h3 className="text-sm font-medium text-slate-400 absolute top-4 left-4">Confidence Score</h3>
              <div className="w-48 h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" cy="50%" 
                    innerRadius="70%" outerRadius="100%" 
                    barSize={16} data={gaugeData} 
                    startAngle={180} endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      minAngle={15}
                      background={{ fill: '#1e293b' }}
                      clockWise
                      dataKey="value"
                      cornerRadius={10}
                      animationDuration={1500}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-4xl font-black" style={{ color: colorHex }}>
                  {result.confidence.toFixed(1)}<span className="text-xl">%</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Wrong Result?</span>
              </button>
              <button 
                onClick={handleReport}
                disabled={reporting}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-300 hover:text-red-200 border border-red-800/50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                <span>Report URL</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
              <span className="bg-slate-800 border border-slate-600 px-2 py-1 rounded text-xs mr-2 text-slate-400">SHAP</span>
              Explainability Panel
            </h3>
            
            {result.top_features && result.top_features.length > 0 ? (
              <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.top_features.map(f => ({
                      name: f.feature,
                      impact: Math.abs(f.impact),
                      originalImpact: f.impact,
                      fill: f.impact > 0 ? '#ef4444' : '#22c55e'
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={140} stroke="#cbd5e1" fontSize={11} tick={{fill: '#cbd5e1'}} />
                    <Tooltip 
                      cursor={{fill: '#1e293b'}} 
                      contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem'}}
                      itemStyle={{color: '#f8fafc', fontWeight: '500'}}
                      labelStyle={{color: '#94a3b8', marginBottom: '4px'}}
                      formatter={(value, name, props) => {
                        const isPhishingSignal = props.payload.originalImpact > 0;
                        return [
                          `${props.payload.originalImpact > 0 ? '+' : ''}${props.payload.originalImpact.toFixed(3)} (${isPhishingSignal ? 'Phishing Signal' : 'Safe Signal'})`, 
                          "Impact"
                        ];
                      }}
                    />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center justify-center p-6 text-slate-500 text-sm text-center">
                No feature explainability data available for this scan.
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3 text-center">
              Features with <span className="text-red-400 font-medium">red</span> impact push towards phishing, <span className="text-emerald-400 font-medium">green</span> towards safe.
            </p>
          </div>

        </div>
      </div>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        scanId={result.scan_id} 
      />
    </>
  );
}

export default ResultCard;
