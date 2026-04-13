import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import { RefreshCw, Save, Check, ArrowRight, ListTodo, Map, Briefcase, X, TrendingUp, User, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Roadmap from './Roadmap';
import SkillGapPanel from '../components/SkillGapPanel';

export default function CareerAnalysis() {
  const { impersonatedUser: user, checkAuth } = useUser();
  const navigate = useNavigate();
  const CACHE_KEY = user ? `career_analysis_draft_${user.id_user}` : null;

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await careerService.syncProfileSkills();
      if (res.profile_updated && checkAuth) {
        await checkAuth();
      }
      alert(res.message);
    } catch (e) {
      console.error(e);
      alert("Gagal sinkronisasi profil.");
    } finally {
      setSyncing(false);
    }
  };
  const [resultData, setResultData] = useState(() => {
    if (!CACHE_KEY) return null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCareerIdx, setSelectedCareerIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRoadmap, setHasRoadmap] = useState(true); // Default to true to avoid flicker if needed, but Roadmap will update it

  const handleSkillUpdate = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    if (!CACHE_KEY) return;
    if (resultData) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(resultData));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  }, [resultData, CACHE_KEY]);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setResultData(null);
    setSaved(false);
    setError(null);
    setSelectedCareerIdx(0);
    try {
      const res = await careerService.generateAnalysis(user.id_user);
      setResultData(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 401
        ? 'Sesi tidak valid. Silakan login ulang.'
        : 'Gagal menghasilkan rekomendasi karir. AI mungkin sedang sibuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (hasRoadmap) {
      const confirmSave = window.confirm("Anda sudah memiliki roadmap aktif. Menyimpan roadmap baru akan menghapus progress dan roadmap lama Anda. Lanjutkan?");
      if (!confirmSave) return;
    }
    setSaveLoading(true);
    try {
      const chosenCareer = resultData.careers ? resultData.careers[selectedCareerIdx] : resultData.career;
      const finalData = { ...resultData, careers: [chosenCareer] };
      await careerService.saveAnalysis(user.id_user, finalData);
      if (CACHE_KEY) localStorage.removeItem(CACHE_KEY);
      setSaved(true);
      setIsModalOpen(false);
      handleSkillUpdate(); // Refresh skill gap after save
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan hasil karir: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user) return (
    <div className="p-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-700 p-4 rounded-xl">
        <p className="font-bold mb-1">Belum Login</p>
        <p>Silakan login untuk menggunakan fitur Analisis Karir.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-10 pb-16">

      {/* ── Page Header with Action Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Briefcase size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Capaian Karir</h1>
            <p className="text-slate-400 text-xs">Kelola skill gap, pratinjau roadmap, dan analisis karir AI</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm text-sm disabled:opacity-70"
          >
            {syncing ? <RefreshCw size={16} className="animate-spin" /> : <Repeat size={16} />}
            Sinkronisasi Skill
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-100 transition disabled:opacity-60 text-sm"
          >
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Briefcase size={16} />}
            {loading ? 'AI Menganalisis...' : 'Analisis Karir Baru'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ── Section 1: Skill Gap (NOW TOP) ── */}
      {hasRoadmap && (
        <>
          <section>
            <SkillGapPanel refreshKey={refreshKey} />
          </section>
          
          {/* ── Divider ── */}
          <div className="border-t border-slate-100" />
        </>
      )}

      {/* ── Section 2: Peta Karir (Roadmap) ── */}
      <section>
        <Roadmap onSkillUpdate={handleSkillUpdate} onGenerate={handleGenerate} onLoad={setHasRoadmap} />
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Career Results Modal ── */}
      {isModalOpen && resultData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-md w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Briefcase size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Rekomendasi Karir AI</h3>
                  <p className="text-slate-500 text-xs">Pilih jalur karir yang ingin Anda simpan ke roadmap</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {(resultData.careers || (resultData.career ? [resultData.career] : [])).map((careerItem, cIdx) => {
                  const isSelected = selectedCareerIdx === cIdx;
                  return (
                    <div
                      key={cIdx}
                      onClick={() => setSelectedCareerIdx(cIdx)}
                      className={`p-6 rounded-2xl border relative cursor-pointer transition-all duration-300 flex flex-col h-full ${isSelected
                        ? 'bg-white border-emerald-400 ring-4 ring-emerald-50 shadow-xl'
                        : 'bg-white/60 border-slate-200 opacity-70 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 hover:border-emerald-200'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Check size={16} className="text-white stroke-[3]" />
                        </div>
                      )}

                      <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-lg mb-3 uppercase tracking-widest ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {cIdx === 0 ? 'Prioritas' : `Alternatif ${cIdx}`}
                      </span>

                      <h4 className={`text-xl font-black mb-3 leading-tight ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {careerItem.name}
                      </h4>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">{careerItem.reason}</p>

                      <div className="space-y-4 mt-auto">
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                          <p className="text-[10px] font-bold text-emerald-700 mb-2 uppercase tracking-wider">Skill Kunci</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(() => {
                              const skills = new Set();
                              resultData.roadmap?.forEach(phase => {
                                phase.steps?.forEach(step => {
                                  if (Array.isArray(step.skill_tags)) {
                                    step.skill_tags.forEach(tag => skills.add(tag));
                                  } else if (typeof step.skill_tags === 'string') {
                                    try {
                                      const parsed = JSON.parse(step.skill_tags);
                                      if (Array.isArray(parsed)) parsed.forEach(t => skills.add(t));
                                    } catch { skills.add(step.skill_tags); }
                                  }
                                });
                              });
                              const skillList = Array.from(skills).slice(0, 5);
                              return skillList.map((skill, si) => (
                                <span key={si} className="px-1.5 py-0.5 bg-white text-emerald-600 text-[9px] rounded-md font-bold border border-emerald-200">
                                  {skill}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-start gap-2 text-[11px] text-slate-600">
                            <span className="text-emerald-500 font-bold mt-1">✓</span>
                            <span>{careerItem.strengths?.[0] || 'Potensi Tinggi'}</span>
                          </div>
                          <div className="flex items-start gap-2 text-[11px] text-slate-600">
                            <span className="text-amber-500 font-bold mt-1">!</span>
                            <span>{careerItem.weaknesses?.[0] || 'Perlu Belajar'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview Bar */}
              <div className="bg-emerald-900 text-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                  <div>
                    <p className="font-bold text-white">Analisis Karir Siap!</p>
                    <p className="text-emerald-300 text-xs">AI merekomendasikan <strong>{resultData.roadmap?.length || 0} Fase Roadmap</strong> dan <strong>{resultData.tasks?.length || 0} Tugas</strong> spesifik.</p>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleGenerate}
                    disabled={loading || saveLoading}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm backdrop-blur-md border border-white/10"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Regenerasi
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl shadow-xl text-sm font-black transition text-emerald-900 bg-white hover:bg-emerald-50 disabled:opacity-70"
                  >
                    {saveLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saveLoading ? 'Menyimpan...' : 'Simpan Roadmap'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved Success Overlay ── */}
      {saved && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Check size={40} className="stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Berhasil!</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">Roadmap karir Anda telah disimpan. Mari mulai belajar!</p>
            <div className="space-y-3">
              <button
                onClick={() => setSaved(false)}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                Lihat Roadmap
              </button>
              <button
                onClick={() => navigate('/todos')}
                className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Buka Todolist
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
