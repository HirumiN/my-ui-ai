import React, { useState } from 'react';
import careerService from '../services/careerService';
import { Sparkles, Send, CheckCircle, Plus, Pencil, Trash2, RefreshCw, Check, X } from 'lucide-react';

// ── XP Toast ────────────────────────────────────────────────────
export function XPToast({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-2xl max-w-xs animate-bounce-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🎉</div>
        <p className="font-bold text-sm">Step Selesai! +{data.xp_granted} XP</p>
        <button onClick={onClose} className="ml-auto text-white/60 hover:text-white">
          <X size={16} />
        </button>
      </div>
      {data.skills_updated.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.skills_updated.map(s => (
            <span key={s.skill_name} className="text-xs bg-white/20 rounded-full px-2 py-0.5">
              {s.skill_name} → Lvl {s.level} ({s.xp_points} XP)
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Adaptive AI Chat Panel ─────────────────────────────────────
export default function RoadmapChat({ roadmapId, onApplied }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [applying, setApplying] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !roadmapId) return;
    setLoading(true);
    setPreview(null);
    try {
      const data = await careerService.adaptRoadmapPreview(roadmapId, message);
      setPreview(data);
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi AI. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!preview) return;
    setApplying(true);
    try {
      await careerService.adaptRoadmapApply(roadmapId, preview.proposed_changes);
      setPreview(null);
      setMessage('');
      onApplied?.();
    } catch (e) {
      console.error(e);
      alert('Gagal menerapkan perubahan.');
    } finally {
      setApplying(false);
    }
  };

  const ACTION_STYLES = {
    add: 'border-l-4 border-emerald-400 bg-emerald-50',
    remove: 'border-l-4 border-rose-400 bg-rose-50 opacity-70',
    edit: 'border-l-4 border-yellow-400 bg-yellow-50',
    keep: 'border-l-4 border-slate-200 bg-white',
  };
  const ACTION_LABELS = {
    add: { label: '+ Tambah', cls: 'bg-emerald-100 text-emerald-700' },
    remove: { label: '− Hapus', cls: 'bg-rose-100 text-rose-700' },
    edit: { label: '✏ Edit', cls: 'bg-yellow-100 text-yellow-700' },
    keep: { label: 'Tetap', cls: 'bg-slate-100 text-slate-500' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* AI Message Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Sparkles size={16} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">AI Roadmap Coach</p>
          <p className="text-xs text-slate-400">Tanya AI untuk menyesuaikan roadmap-mu</p>
        </div>
      </div>

      {/* Preview Changes */}
      {preview && (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1 custom-scrollbar">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
            <Sparkles size={14} className="inline mr-1 mb-0.5" />
            <strong>AI:</strong> {preview.ai_message}
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perubahan yang diusulkan:</p>
          {preview.proposed_changes.filter(c => c.action !== 'keep').map((change, i) => {
            const style = ACTION_STYLES[change.action] || ACTION_STYLES.keep;
            const labelInfo = ACTION_LABELS[change.action] || ACTION_LABELS.keep;
            return (
              <div key={i} className={`rounded-xl p-3 shadow-sm ${style}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${labelInfo.cls}`}>{labelInfo.label}</span>
                  <span className="text-xs text-slate-400">{change.phase}</span>
                </div>
                <p className={`font-semibold text-sm ${change.action === 'remove' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {change.title}
                </p>
                {change.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{change.description}</p>
                )}
              </div>
            );
          })}
          {/* Apply / Reject */}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setPreview(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              ✕ Tolak
            </button>
            <button onClick={handleApply} disabled={applying} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
              {applying ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              Terapkan
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {!preview && (
        <div className="flex-1 flex flex-col justify-end">
          <div className="space-y-2 mb-3 text-xs text-slate-400">
            <p className="font-medium text-slate-500 text-xs mb-2">Contoh pesan:</p>
            {['Fokuskan ke backend dulu', 'Aku lebih suka data daripada ML', 'Tambahkan step untuk DevOps'].map(ex => (
              <button key={ex} onClick={() => setMessage(ex)} className="block w-full text-left px-3 py-1.5 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                "{ex}"
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ceritakan preferensimu..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center transition-colors"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
