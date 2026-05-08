import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function FeedbackModal({ isOpen, onClose, scanId }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (isPhishing) => {
    setLoading(true);
    try {
      await api.post('/feedback', {
        scan_id: scanId,
        correct_label: isPhishing ? 'Phishing' : 'Safe',
        user_comment: comment
      });
      toast.success('Thanks! Your feedback helps improve PhishNet.');
      onClose();
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-slate-100">Was this prediction wrong?</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-400">
            Help us improve our model by providing the correct label for this URL.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none h-24 text-sm"
              placeholder="What specifically was wrong?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-900/40 text-emerald-400 border border-emerald-800 hover:bg-emerald-800/50 hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
              <span className="font-medium text-sm">Mark as Safe</span>
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-800/50 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
              <span className="font-medium text-sm">Mark as Phishing</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FeedbackModal;
