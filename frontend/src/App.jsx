import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BulkScan from './pages/BulkScan';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bulk" element={<BulkScan />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <Toaster position="bottom-right" toastOptions={{
        className: 'bg-slate-800 text-slate-100 border border-slate-700',
        duration: 4000,
      }} />
    </div>
  );
}

export default App;
