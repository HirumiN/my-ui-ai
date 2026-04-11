import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import RoadmapChat, { XPToast } from '../components/RoadmapChat';
import { Map, CheckCircle, Clock, MapPin, Target, Trash2, X, PenLine, Plus, Check, ChevronDown, ChevronUp, Star, ArrowRight } from 'lucide-react';

export default function Roadmap({ onSkillUpdate, onGenerate, onLoad }) {
  const { impersonatedUser: user } = useUser();
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activePopupPhase, setActivePopupPhase] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [xpToast, setXpToast] = useState(null);

  // Inline edit state
  const [editingStepId, setEditingStepId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const fetchRoadmaps = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await careerService.getRoadmaps();
      setRoadmaps(data);
      if (onLoad) onLoad(data.length > 0);
      if (data.length > 0) setActiveRoadmapId(data[data.length - 1].id);
    } catch (error) {
      console.error(error);
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        setFetchError('Sesi tidak valid. Silakan logout dan login ulang.');
      } else {
        setFetchError(`Gagal memuat roadmap: ${error.response?.data?.detail || error.message}`);
      }
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchRoadmaps(); }, [fetchRoadmaps]);

  const fetchDetails = useCallback(async () => {
    if (!activeRoadmapId) return;
    setStepsLoading(true);
    try {
      const [stepsRes, progressRes] = await Promise.all([
        careerService.getRoadmapSteps(activeRoadmapId),
        careerService.getCareerProgress()
      ]);
      setSteps(stepsRes);
      setProgressData(progressRes);
    } catch (error) { console.error(error); }
    finally { setStepsLoading(false); }
  }, [activeRoadmapId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  // ── Complete step → grant XP ──────────────────────────────────
  const completeStep = async (step, progress) => {
    if (progress?.status === 'completed') {
      // Undo: revert to pending via old progress endpoint
      try {
        await careerService.updateCareerProgress(progress.id, 'pending');
        setProgressData(prev => prev.map(p => p.id === progress.id ? { ...p, status: 'pending' } : p));
      } catch (e) { console.error(e); }
      return;
    }
    try {
      const result = await careerService.completeStep(step.id);
      setProgressData(prev => prev.map(p =>
        p.id_roadmap_step === step.id ? { ...p, status: 'completed' } : p
      ));
      
      // Always trigger skill update to refresh Skill Gap panel (XP/Levels)
      if (onSkillUpdate) onSkillUpdate();
      
      if (result.skills_updated?.length > 0) {
        setXpToast(result);
        setTimeout(() => setXpToast(null), 5000);
      }
    } catch (e) { console.error(e); }
  };

  // ── Inline edit ───────────────────────────────────────────────
  const startEdit = (step) => {
    setEditingStepId(step.id);
    setEditDraft({ title: step.title, description: step.description });
  };

  const saveEdit = async (stepId) => {
    try {
      await careerService.editStep(stepId, editDraft);
      setSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...editDraft } : s));
    } catch (e) { console.error(e); }
    setEditingStepId(null);
  };

  // ── Delete step ───────────────────────────────────────────────
  const deleteStep = async (stepId) => {
    if (!window.confirm('Hapus step ini?')) return;
    try {
      await careerService.deleteStep(stepId);
      setSteps(prev => prev.filter(s => s.id !== stepId));
    } catch (e) { console.error(e); }
  };

  // ── Delete roadmap ────────────────────────────────────────────
  const handleDeleteRoadmap = async (roadmapId) => {
    if (!window.confirm('Hapus peta karir ini?')) return;
    try {
      setLoading(true);
      await careerService.deleteRoadmap(roadmapId);
      const updated = roadmaps.filter(r => r.id !== roadmapId);
      setRoadmaps(updated);
      if (activeRoadmapId === roadmapId) {
        setActiveRoadmapId(updated.length > 0 ? updated[updated.length - 1].id : null);
        setSteps([]);
      }
    } catch (e) { console.error(e); alert('Gagal menghapus roadmap.'); }
    finally { setLoading(false); }
  };

  if (!user) return (
    <div className="p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-xl" role="alert">
        <p className="font-bold mb-1">Belum Login</p>
        <p>Silakan Sign in dengan Google untuk melihat Roadmap.</p>
      </div>
    </div>
  );

  const stepsByPhase = steps.reduce((acc, step) => {
    if (!acc[step.phase]) acc[step.phase] = [];
    acc[step.phase].push(step);
    return acc;
  }, {});

  return (
    <div className="w-full h-full pb-10 relative">
      {/* XP Toast */}
      <XPToast data={xpToast} onClose={() => setXpToast(null)} />

      {/* ── Header ── */}
      <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Alur Pembelajaran</h2>
          <p className="text-slate-500 mt-1 text-sm">Centang langkah untuk mendapat XP dan maju menuju target karir.</p>
        </div>
        {/* AI Coach button removed for persistence */}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Clock className="animate-spin text-slate-400" size={32} /></div>
      ) : fetchError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <p className="text-rose-600 font-semibold">{fetchError}</p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <MapPin className="mx-auto text-emerald-400 mb-6" size={48} />
          <h3 className="text-2xl font-black text-slate-800 mb-2">Belum Ada Roadmap Aktif</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">Anda belum memiliki rencana karir. Gunakan AI untuk menganalisis jalur karir terbaik dan buat roadmap otomatis sekarang.</p>
          <button
            onClick={onGenerate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all mx-auto"
          >
            Cek Rekomendasi Karir <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
          {/* Main: Phase Node Graph (Expanded) */}
          <div className="lg:col-span-9">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 shadow-sm min-h-[500px] flex justify-center">
              {stepsLoading ? (
                <div className="flex justify-center p-12"><Clock className="animate-spin text-emerald-400" size={32} /></div>
              ) : (
                <div className="flex flex-col items-center w-full relative pt-2">
                  {Object.entries(stepsByPhase).map(([phase, phaseSteps], index) => {
                    const isCompleted = phaseSteps.every(step => {
                      const p = progressData.find(pr => pr.id_roadmap_step === step.id);
                      return p?.status === 'completed';
                    });
                    return (
                      <div key={phase} className="relative flex justify-center w-full mb-10">
                        {index !== Object.entries(stepsByPhase).length - 1 && (
                          <div className="absolute top-[4.5rem] h-10 w-1.5 bg-emerald-100 z-0" />
                        )}
                        <button
                          onClick={() => setActivePopupPhase(phase)}
                          className={`w-72 sm:w-80 py-4 px-6 rounded-2xl font-bold shadow-md text-center transition-all hover:scale-105 border-4 z-10 ${isCompleted ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-white border-emerald-300 text-slate-800 hover:border-emerald-500'}`}
                        >
                          <div className="text-[10px] uppercase font-black tracking-widest mb-1 opacity-60">Fase {index + 1}</div>
                          {phase}
                          {isCompleted && <span className="ml-2 inline-block text-emerald-500">✓</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── AI Chat Panel (Persistent) ── */}
          <div className="lg:col-span-3 bg-white border border-emerald-100 rounded-2xl shadow-sm p-5 flex flex-col h-[600px] sticky top-6">
            <RoadmapChat
              roadmapId={activeRoadmapId}
              onApplied={() => { fetchDetails(); }}
            />
          </div>
        </div>
      )}

      {/* ── Backdrop ── */}
      {activePopupPhase && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setActivePopupPhase(null)} />
      )}

      {/* ── Drawer: Step Detail + Inline Edit ── */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${activePopupPhase ? 'translate-x-0' : 'translate-x-full'}`}>
        {activePopupPhase && (
          <>
            <div className="p-6 border-b bg-emerald-50 flex justify-between items-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1">Rincian Fase</div>
                <h3 className="font-bold text-xl text-emerald-900 pr-4">{activePopupPhase}</h3>
              </div>
              <button onClick={() => setActivePopupPhase(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-slate-50 space-y-4">
              {stepsByPhase[activePopupPhase]?.map(step => {
                const progress = progressData.find(p => p.id_roadmap_step === step.id);
                const isDone = progress?.status === 'completed';
                const isEditing = editingStepId === step.id;
                let skillList = [];
                try { skillList = JSON.parse(step.skill_tags || '[]'); } catch { skillList = []; }

                return (
                  <div key={step.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${isDone ? 'border-emerald-200 bg-emerald-50/30 opacity-80' : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'}`}>
                    <div className="flex gap-3">
                      {/* Complete button */}
                      <button onClick={() => completeStep(step, progress)} className="mt-1 shrink-0 focus:outline-none transition-transform hover:scale-110">
                        {isDone
                          ? <CheckCircle className="text-emerald-500" size={22} />
                          : <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-400 bg-white" />
                        }
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* ── Inline Edit Mode ── */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-200"
                              value={editDraft.title}
                              onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
                            />
                            <textarea
                              className="w-full border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200"
                              value={editDraft.description || ''}
                              onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(step.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-semibold hover:bg-emerald-600">
                                <Check size={12} /> Simpan
                              </button>
                              <button onClick={() => setEditingStepId(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200">
                                <X size={12} /> Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h5 className={`font-bold text-base mb-1.5 leading-snug ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              {step.title}
                            </h5>
                            {step.description && (
                              <p className={`text-sm leading-relaxed mb-2 ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                                {step.description}
                              </p>
                            )}
                            {/* Skill Tags */}
                            {skillList.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {skillList.map(skill => (
                                  <span key={skill} className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Star size={10} /> +{step.xp_reward || 10} XP saat selesai
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isEditing && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => startEdit(step)} className="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors">
                            <PenLine size={14} />
                          </button>
                          <button onClick={() => deleteStep(step.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
