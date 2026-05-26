import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import { RefreshCw, Save, Check, ArrowRight, ListTodo, Map, Briefcase, X, TrendingUp, User, Repeat, AlertTriangle, Terminal, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Roadmap from './Roadmap';
import SkillGapPanel from '../components/SkillGapPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendNotification } from '../services/notificationService';

export default function CareerAnalysis() {
  const { 
    impersonatedUser: user, 
    checkAuth,
    careerResult: resultData,
    setCareerResult: setResultData,
    careerLoading: loading,
    careerError: error,
    isCareerModalOpen: isModalOpen,
    setIsCareerModalOpen: setIsModalOpen,
    generateCareerAnalysisGlobal
  } = useUser();
  const navigate = useNavigate();

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

  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCareerIdx, setSelectedCareerIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [roadmapKey, setRoadmapKey] = useState(0);
  const [hasRoadmap, setHasRoadmap] = useState(true); // Default to true to avoid flicker if needed, but Roadmap will update it
  const [showDevLogs, setShowDevLogs] = useState(false);

  const handleSkillUpdate = () => setRefreshKey(prev => prev + 1);

  const handleGenerate = async () => {
    if (!user) return;
    setSaved(false);
    setSelectedCareerIdx(0);
    await generateCareerAnalysisGlobal();
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
      setResultData(null); // Clear context result data after save
      setSaved(true);
      setIsModalOpen(false);
      handleSkillUpdate(); // Refresh skill gap after save
      setRoadmapKey(prev => prev + 1); // Refresh roadmap list & details immediately
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

  const isOnboardingDone = user?.universitas && user?.jurusan && user?.target_karir;
  if (!isOnboardingDone) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10">
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-100 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 mx-auto flex items-center justify-center bg-amber-100 rounded-2xl text-amber-600">
            <User size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">
              Profil Akademik Belum Lengkap
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Silakan lengkapi data Onboarding Anda (seperti Universitas, Jurusan, dan Target Karir) terlebih dahulu di halaman Profile agar AI dapat mendesain roadmap karir Anda secara akurat.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="bg-gradient-to-br from-rose-50 to-amber-50/50 border border-rose-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-xl text-rose-600 shrink-0 animate-pulse">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-rose-900 text-base">
                Layanan AI Sedang Mengalami Kendala
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {error}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowDevLogs(!showDevLogs)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 transition"
                >
                  <Terminal size={14} />
                  {showDevLogs ? 'Sembunyikan Log Dev' : 'Lihat Log Detail & Panduan Token'}
                  {showDevLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Info Tambahan di Inspect Console
                </span>
              </div>
            </div>
          </div>

          {showDevLogs && (
            <div className="bg-slate-900 text-slate-200 font-mono text-xs rounded-xl p-4 border border-slate-800 space-y-3 overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                <span className="flex items-center gap-1.5"><Terminal size={12} /> SYSTEM_DIAGNOSTICS_LOG</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-bold">GEMINI_RAG_V1</span>
              </div>
              <p className="text-rose-400 font-semibold">
                [EXHAUSTION_WARNING] Terjadi hambatan token/limitasi pada endpoint '/rag/query' atau '/generate-career'.
              </p>
              <div className="space-y-1 text-slate-300">
                <p><span className="text-slate-500">1.</span> Pastikan Anda sudah mengisi <span className="text-emerald-400">GEMINI_API_KEY</span> yang aktif di file <span className="text-emerald-400">fastapi-simple-rag/.env</span>.</p>
                <p><span className="text-slate-500">2.</span> Free tier rate limit Google Gemini adalah 15 requests per menit & 20 requests per hari pada beberapa project.</p>
                <p><span className="text-slate-500">3.</span> Jika API Key Anda terekspos ke repositori publik, Google akan <span className="text-rose-400">menonaktifkan kunci tersebut secara permanen</span>.</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">💡 Cara Mengganti API Key:</p>
                <p>1. Buka berkas <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-300">fastapi-simple-rag/.env</code></p>
                <p>2. Cari baris <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-300">GEMINI_API_KEY=AIzaSy...</code></p>
                <p>3. Ganti dengan API Key baru Anda, simpan, lalu reload halaman ini!</p>
              </div>
            </div>
          )}
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
        <Roadmap key={roadmapKey} onSkillUpdate={handleSkillUpdate} onGenerate={handleGenerate} onLoad={setHasRoadmap} />
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Career Results Modal ── */}
      {isModalOpen && resultData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-md w-full max-w-7xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
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

                      <div className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {careerItem.reason}
                        </ReactMarkdown>
                      </div>

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
                              const allSkills = Array.from(skills);
                              const skillList = allSkills.slice(0, 6);
                              return (
                                <>
                                  {skillList.map((skill, si) => (
                                    <span key={si} className="px-1.5 py-0.5 bg-white text-emerald-600 text-[9px] rounded-md font-bold border border-emerald-200">
                                      {skill}
                                    </span>
                                  ))}
                                  {allSkills.length > 6 && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-md font-bold border border-slate-200">
                                      +{allSkills.length - 6} lainnya
                                    </span>
                                  )}
                                </>
                              );
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
