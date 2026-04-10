import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import { RefreshCw, Save, Check, ArrowRight, ListTodo, Map, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Roadmap from './Roadmap';
import SkillGapPanel from '../components/SkillGapPanel';

export default function CareerAnalysis() {
  const { impersonatedUser: user } = useUser();
  const navigate = useNavigate();
  const CACHE_KEY = user ? `career_analysis_draft_${user.id_user}` : null;

  const [loading, setLoading] = useState(false);
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
    setSaveLoading(true);
    try {
      const chosenCareer = resultData.careers ? resultData.careers[selectedCareerIdx] : resultData.career;
      const finalData = { ...resultData, careers: [chosenCareer] };
      await careerService.saveAnalysis(user.id_user, finalData);
      if (CACHE_KEY) localStorage.removeItem(CACHE_KEY);
      setSaved(true);
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

      {/* ── Section 1: Analisis Karir AI ── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Briefcase size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Analisis Karir AI</h2>
            <p className="text-slate-400 text-xs">Rekomendasi karir berdasarkan profil & aktivitas akademikmu</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!resultData && !saved && (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/50">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
              <Briefcase size={24} className="text-indigo-500" />
            </div>
            <p className="text-slate-600 text-sm mb-5 text-center max-w-xs">AI akan menganalisis profil, jadwal, dan keterampilanmu untuk memberi rekomendasi karir terbaik.</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60"
            >
              {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Briefcase size={16} />}
              {loading ? 'AI Sedang Menganalisis...' : 'Buat Rekomendasi Karir'}
            </button>
          </div>
        )}

        {resultData && !saved && (
          <div className="space-y-6">
            {/* Career Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {(resultData.careers || (resultData.career ? [resultData.career] : [])).map((careerItem, cIdx) => {
                const isSelected = selectedCareerIdx === cIdx;
                return (
                  <div
                    key={cIdx}
                    onClick={() => setSelectedCareerIdx(cIdx)}
                    className={`p-6 rounded-2xl border relative cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 shadow-lg shadow-indigo-100'
                        : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={13} className="text-white stroke-[3]" />
                      </span>
                    )}
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wider ${
                      isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {cIdx === 0 ? 'Prioritas Utama' : `Alternatif ${cIdx}`}
                    </span>
                    <h3 className={`text-lg font-extrabold mb-2 ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>
                      {careerItem.name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{careerItem.reason}</p>
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-700 mb-2">💪 Kelebihan</p>
                        <ul className="space-y-1">
                          {(careerItem.strengths || []).map((s, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-emerald-500">•</span>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-amber-100">
                        <p className="text-xs font-bold text-amber-700 mb-2">⚖️ Tantangan</p>
                        <ul className="space-y-1">
                          {(careerItem.weaknesses || []).map((w, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-amber-400">•</span>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info bar */}
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl text-indigo-800 text-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 text-lg">💡</div>
              <div>
                <p className="font-bold mb-0.5">Pratinjau berhasil dibuat!</p>
                <p className="text-indigo-600 text-xs">AI menyusun <strong>{resultData.roadmap?.length || 0} Fase Roadmap</strong> dan <strong>{resultData.tasks?.length || 0} Tugas</strong>. Simpan ke profil untuk mulai menjalankan rencana ini.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading || saveLoading}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition text-sm shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Buat Ulang
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 shadow-indigo-200"
              >
                {saveLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saveLoading ? 'Menyimpan...' : 'Simpan ke Profil'}
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div className="py-10 text-center bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Rencana Karir Tersimpan!</h3>
            <p className="text-slate-500 text-sm mb-6">Roadmap dan daftar tugas sudah ditambahkan ke akunmu.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/todos')}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition"
              >
                <ListTodo size={15} /> Buka Todolist <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Section 2: Peta Karir (Roadmap) ── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Map size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Peta Karir</h2>
            <p className="text-slate-400 text-xs">Progress roadmap belajar dan pencapaian XP-mu</p>
          </div>
        </div>
        <Roadmap />
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Section 3: Skill Gap ── */}
      <section>
        <SkillGapPanel />
      </section>
    </div>
  );
}
