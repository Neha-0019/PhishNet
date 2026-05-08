import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/axios';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data);
      } catch (err) {
        // Interceptor handles error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-slate-400">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: 'Phishing', value: stats.phishing_detected, color: '#ef4444' },
    { name: 'Safe', value: stats.safe_detected, color: '#22c55e' }
  ];

  // Use actual 7-day trend data from the backend
  const lineData = stats.trend_data || [];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time overview of scanning activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <Activity className="w-8 h-8 text-blue-400 mb-4" />
          <p className="text-sm font-medium text-slate-400">Total Scans</p>
          <p className="text-3xl font-black text-slate-100 mt-1">{stats.total_scans}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <ShieldAlert className="w-8 h-8 text-red-400 mb-4" />
          <p className="text-sm font-medium text-slate-400">Phishing Detected</p>
          <p className="text-3xl font-black text-slate-100 mt-1">{stats.phishing_detected}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
          <p className="text-sm font-medium text-slate-400">Safe URLs</p>
          <p className="text-3xl font-black text-slate-100 mt-1">{stats.safe_detected}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <PieChartIcon className="w-8 h-8 text-purple-400 mb-4" />
          <p className="text-sm font-medium text-slate-400">Accuracy Estimate</p>
          <p className="text-3xl font-black text-slate-100 mt-1">{stats.accuracy_estimate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Scanning Trends (7 Days)</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                <RechartsTooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem'}}
                />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="phishing" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-200 mb-6">Distribution</h3>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem'}}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
