import React, { useState, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, Play, Download, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import Papa from 'papaparse';
import api from '../api/axios';

function BulkScan() {
  const [file, setFile] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    setFile(selectedFile);
    setScanResults(null);

    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && !results.meta.fields.includes('url')) {
          alert('CSV must contain a column named "url"');
          setFile(null);
          setPreviewUrls([]);
          return;
        }
        setPreviewUrls(results.data.map(row => row.url));
      }
    });
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    
    const formData = new FormData();
    formData.append('file', file);

    const startTime = Date.now();
    try {
      const response = await api.post('/bulk-scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      data.scanTime = ((Date.now() - startTime) / 1000).toFixed(1);
      setScanResults(data);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setIsScanning(false);
    }
  };

  const downloadCSV = () => {
    if (!scanResults || !scanResults.results) return;
    
    const csvData = scanResults.results.map(r => ({
      url: r.url,
      label: r.error ? 'Error' : r.is_phishing ? 'Phishing' : 'Safe',
      confidence: r.error ? '' : r.confidence,
      risk_level: r.error ? r.error : r.risk_level
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'phishnet_bulk_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Bulk Scan</h1>
          <p className="text-slate-400 mt-1">Upload a CSV to analyze up to 500 URLs at once.</p>
        </div>
      </div>

      {!scanResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800'
            }`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          >
            <UploadCloud className={`w-16 h-16 mb-4 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
            <p className="text-lg font-medium text-slate-200 mb-2">Drag and drop your CSV file here</p>
            <p className="text-sm text-slate-500 mb-6">File must contain a column named "url"</p>
            
            <label className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg cursor-pointer transition border border-slate-600 shadow-lg">
              Browse Files
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </label>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col shadow-xl">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-400" />
              Upload Preview
            </h3>
            
            {file ? (
              <div className="flex-1 flex flex-col animate-in fade-in">
                <div className="bg-slate-900 rounded-lg p-3 mb-4 border border-slate-700">
                  <span className="text-sm text-slate-400">Selected file: </span>
                  <span className="text-sm font-medium text-slate-200">{file.name}</span>
                </div>
                
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">First 5 URLs</p>
                <ul className="space-y-2 flex-1">
                  {previewUrls.map((u, i) => (
                    <li key={i} className="text-sm bg-slate-900/50 p-2 rounded border border-slate-700/50 truncate text-slate-300">
                      {u}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Scanning URLs...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Bulk Scan</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
                <p>Upload a CSV to see a preview of the URLs before scanning.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {scanResults && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
              <p className="text-sm text-slate-400">Total Scanned</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{scanResults.total}</p>
            </div>
            <div className="bg-red-900/20 rounded-xl p-4 border border-red-900/50 shadow-lg">
              <p className="text-sm text-red-400/80">Phishing Found</p>
              <p className="text-3xl font-bold text-red-500 flex items-center mt-1">
                <ShieldAlert className="w-6 h-6 mr-2 opacity-80" />
                {scanResults.phishing_count}
              </p>
            </div>
            <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-900/50 shadow-lg">
              <p className="text-sm text-emerald-400/80">Safe Found</p>
              <p className="text-3xl font-bold text-emerald-500 flex items-center mt-1">
                <ShieldCheck className="w-6 h-6 mr-2 opacity-80" />
                {scanResults.safe_count}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
              <p className="text-sm text-slate-400">Scan Time</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{scanResults.scanTime}s</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
              <h3 className="font-bold text-slate-200">Detailed Results</h3>
              <div className="space-x-3 flex">
                <button 
                  onClick={() => { setScanResults(null); setFile(null); }}
                  className="text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition border border-slate-600"
                >
                  New Scan
                </button>
                <button 
                  onClick={downloadCSV}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center space-x-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/90 text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wider">URL</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Label</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Confidence</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {scanResults.results.map((r, i) => {
                    if (r.error) {
                      return (
                        <tr key={i} className="bg-slate-800/30 text-slate-500">
                          <td className="px-6 py-4 truncate max-w-md">{r.url}</td>
                          <td className="px-6 py-4" colSpan={3}>Error: {r.error}</td>
                        </tr>
                      );
                    }
                    
                    const isPhishing = r.is_phishing;
                    return (
                      <tr key={i} className={`hover:bg-slate-700/30 transition-colors ${isPhishing ? 'bg-red-900/5' : 'bg-emerald-900/5'}`}>
                        <td className="px-6 py-4 truncate max-w-md text-slate-300 font-medium">{r.url}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            isPhishing ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
                          }`}>
                            {isPhishing ? 'Phishing' : 'Safe'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-mono">{r.confidence.toFixed(1)}%</td>
                        <td className={`px-6 py-4 font-bold ${
                          r.risk_level === 'Dangerous' ? 'text-red-500' : 
                          r.risk_level === 'Suspicious' ? 'text-yellow-500' : 'text-emerald-500'
                        }`}>
                          {r.risk_level}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default BulkScan;
