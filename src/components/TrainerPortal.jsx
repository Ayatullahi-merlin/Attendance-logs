import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, LogOut, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

export default function TrainerPortal() {
  const [trainerName, setTrainerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'check-in' | 'check-out'
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleAttendanceSubmit = async (actionType) => {
    // Basic validation
    if (!trainerName.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your Trainer Name before submitting.',
      });
      return;
    }

    setLoading(true);
    setActiveAction(actionType);
    setStatusMessage(null);

    try {
      // Insert with status: 'pending' (pending admin approval)
      const { data, error } = await supabase.from('attendance_logs').insert([
        {
          trainer_name: trainerName.trim(),
          action_type: actionType,
          status: 'pending',
        },
      ]);

      if (error) {
        throw error;
      }

      const formattedAction = actionType === 'check-in' ? 'Check In' : 'Check Out';
      setStatusMessage({
        type: 'success',
        text: `Your ${formattedAction} request for "${trainerName.trim()}" has been submitted and is pending Admin approval.`,
      });

      // Clear input after success
      setTrainerName('');
    } catch (err) {
      console.error('Supabase attendance error:', err);
      // Fallback: If status column is missing on DB, try inserting without status field
      if (err.message && err.message.includes('status')) {
        try {
          const { error: retryError } = await supabase.from('attendance_logs').insert([
            {
              trainer_name: trainerName.trim(),
              action_type: actionType,
            },
          ]);
          if (retryError) throw retryError;

          const formattedAction = actionType === 'check-in' ? 'Check In' : 'Check Out';
          setStatusMessage({
            type: 'success',
            text: `Submitted ${formattedAction} request for "${trainerName.trim()}". Pending Admin review.`,
          });
          setTrainerName('');
          return;
        } catch (fallbackErr) {
          setErrorState(fallbackErr);
          return;
        }
      }
      setErrorState(err);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const setErrorState = (err) => {
    setStatusMessage({
      type: 'error',
      text: err.message || 'Failed to submit attendance request. Please check connection.',
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 transition-all">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Trainer Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Submit check-in or check-out request for Admin approval</p>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Input Form */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="trainer-name"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Trainer Name
            </label>
            <input
              id="trainer-name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900 bg-slate-50/50"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && trainerName.trim()) {
                  handleAttendanceSubmit('check-in');
                }
              }}
            />
          </div>

          {/* Action Buttons Side-by-Side */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Check In Button (Navy Blue, Solid) */}
            <button
              type="button"
              onClick={() => handleAttendanceSubmit('check-in')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading && activeAction === 'check-in' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Check In</span>
                </>
              )}
            </button>

            {/* Check Out Button (White with Navy Blue border) */}
            <button
              type="button"
              onClick={() => handleAttendanceSubmit('check-out')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-900 border-2 border-blue-900 font-semibold py-3.5 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading && activeAction === 'check-out' ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-900" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Check Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
