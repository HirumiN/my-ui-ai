import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, MessageSquare, Briefcase, GraduationCap,
  Repeat, Clock, ArrowRight, CheckCircle2, BookOpen, Map,
  Calendar, AlertCircle, Sparkles, RefreshCw, User
} from 'lucide-react';
import dataService from '../services/dataService';
import careerService from '../services/careerService';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Selamat Pagi', emoji: '☀️' };
  if (h < 17) return { text: 'Selamat Siang', emoji: '🌤️' };
  if (h < 20) return { text: 'Selamat Sore', emoji: '🌇' };
  return { text: 'Selamat Malam', emoji: '🌙' };
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const TODAY_NAME = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const PRIORITY_STYLE = {
  'Tinggi': 'bg-red-100 text-red-700',
  'Menengah': 'bg-yellow-100 text-yellow-800',
  'Rendah': 'bg-green-100 text-green-700',
};

export default function Home() {
  const { impersonatedUser: user } = useUser();
  const navigate = useNavigate();
  const greeting = getGreeting();

  const [todos, setTodos] = useState([]);
  const [rutinitas, setRutinitas] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [todosRes, rutRes, jadwalRes, roadmapRes, progressRes] = await Promise.allSettled([
          dataService.getTodos(),
          dataService.getRutinitas(),
          dataService.getJadwal(),
          careerService.getRoadmaps(),
          careerService.getCareerProgress(),
        ]);
        if (todosRes.status === 'fulfilled') setTodos(todosRes.value.data);
        if (rutRes.status === 'fulfilled') setRutinitas(rutRes.value.data);
        if (jadwalRes.status === 'fulfilled') setJadwal(jadwalRes.value.data);
        if (roadmapRes.status === 'fulfilled') setRoadmaps(roadmapRes.value);
        if (progressRes.status === 'fulfilled') setProgress(progressRes.value);
      } catch (_) { }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const activeTodos = todos.filter(t => !t.is_completed);
  const completedTodos = todos.filter(t => t.is_completed);
  const todayJadwal = jadwal.filter(j => j.hari === TODAY_NAME);
  const completedSteps = progress.filter(p => p.status === 'completed').length;
  const totalSteps = progress.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-8 text-slate-900 shadow-sm group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-100 transition-all duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                {greeting.emoji} {greeting.text}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-slate-800">
              Halo, <span className="text-emerald-600">{user ? user.nama.split(' ')[0] : 'Mahasiswa'}</span>
            </h1>

            <p className="text-slate-600 text-sm mb-6 font-medium md:whitespace-nowrap leading-relaxed">
              Selamat datang kembali. Siap untuk melangkah lebih jauh dalam karir dan akademik Anda hari ini?
            </p>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/career-analysis')}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Sparkles size={16} />
                Rekomendasi Karir AI
              </button>

              <button 
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 active:scale-95"
              >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : <Repeat size={16} />}
                Sinkronisasi Skill
              </button>
            </div>
          </div>

          {/* Quick stat pills */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Tugas', value: activeTodos.length },
              { label: 'Jadwal', value: todayJadwal.length },
            ].map((s, i) => (
              <div
                key={s.label}
                className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[100px] shadow-sm"
              >
                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Todolist Preview ── */}
        <PreviewCard
          title="Todolist"
          subtitle={`${activeTodos.length} tugas belum selesai`}
          icon={<CheckSquare size={16} className="text-emerald-700" />}
          accentClass="border-emerald-200"
          onViewAll={() => navigate('/planner')}
          loading={loading}
          empty={activeTodos.length === 0}
          emptyText="Tidak ada tugas aktif 🎉"
        >
          {activeTodos.slice(0, 4).map(t => (
            <div key={t.id_todo} className="group flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-1 rounded-lg transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full border-2 ${t.tipe === 'Tinggi' ? 'border-rose-400 bg-rose-50' : 'border-emerald-300'} shrink-0`} />
              <p className="text-sm font-medium text-slate-700 flex-1 truncate">{t.nama}</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-tight ${t.tipe === 'Tinggi' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                t.tipe === 'Menengah' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                {t.tipe}
              </span>
            </div>
          ))}
        </PreviewCard>

        {/* ── Jadwal Hari Ini ── */}
        <PreviewCard
          title="Jadwal Hari Ini"
          subtitle={TODAY_NAME}
          icon={<Calendar size={16} className="text-yellow-700" />}
          accentClass="border-yellow-200"
          onViewAll={() => navigate('/planner')}
          loading={loading}
          empty={todayJadwal.length === 0}
          emptyText="Tidak ada jadwal hari ini 😌"
        >
          {todayJadwal.slice(0, 4).map(j => (
            <div key={j.id_jadwal} className="flex items-center gap-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-1 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 shrink-0 flex items-center justify-center font-bold text-xs shadow-sm">
                {j.jam_mulai?.slice(0, 5)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{j.nama}</p>
                <p className="text-[11px] text-slate-500 font-medium">Selesai {j.jam_selesai?.slice(0, 5)}</p>
              </div>
              <div className="px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100">
                {j.sks} SKS
              </div>
            </div>
          ))}
        </PreviewCard>

        {/* ── Rutinitas ── */}
        <PreviewCard
          title="Rutinitas Harian"
          subtitle={`${rutinitas.length} kebiasaan terdaftar`}
          icon={<Repeat size={16} className="text-emerald-700" />}
          accentClass="border-emerald-200"
          onViewAll={() => navigate('/planner')}
          loading={loading}
          empty={rutinitas.length === 0}
          emptyText="Belum ada rutinitas terdaftar"
        >
          {rutinitas.slice(0, 4).map(r => (
            <div key={r.id_rutinitas} className="flex items-center gap-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-1 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 flex items-center justify-center">
                <Repeat size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{r.nama}</p>
                <p className="text-[11px] text-slate-500 font-medium">{r.hari} · {r.jam_mulai?.slice(0, 5) || 'Kapan saja'}</p>
              </div>
            </div>
          ))}
        </PreviewCard>

        {/* ── Career Roadmap Preview ── */}
        <PreviewCard
          title="Karir & Roadmap"
          subtitle={roadmaps.length > 0 ? `${roadmaps.length} Roadmap Tersimpan` : 'Belum ada roadmap'}
          icon={<Map size={16} className="text-slate-600" />}
          accentClass="border-slate-200"
          onViewAll={() => navigate('/career-analysis')}
          loading={loading}
          empty={roadmaps.length === 0}
          emptyText="Generate roadmap karir AI mu!"
        >
          {/* Progress bar */}
          {totalSteps > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Progres Pembelajaran</span>
                <span className="font-semibold">{completedSteps}/{totalSteps} selesai</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.round((completedSteps / totalSteps) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {roadmaps.slice(0, 3).map(rm => (
            <div key={rm.id} className="flex items-center gap-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-1 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 flex items-center justify-center">
                <Briefcase size={14} />
              </div>
              <p className="text-sm font-bold text-slate-800 flex-1 truncate">{rm.title}</p>
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={12} />
              </div>
            </div>
          ))}
        </PreviewCard>

      </div>

      {/* ── AI Career Recommendation Banner ── */}
      {/* <button
        onClick={() => navigate('/career-analysis')}
        className="w-full flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-3xl px-8 py-6 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 shadow-xl group overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-lg border border-white/20 shadow-inner group-hover:bg-white/30 transition-all">
            <Sparkles size={28} className="text-white animate-pulse" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-xl mb-1">Dapatkan Rekomendasi Karir AI</p>
            <p className="text-emerald-50 text-sm font-medium opacity-90">Analisis skill gap dan susun roadmap masa depanmu sekarang juga</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 group-hover:bg-emerald-400/40 transition-all">
          <span className="text-sm font-bold">Mulai Sekarang</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </button> */}
    </div>
  );
}

/* Reusable Preview Card */
function PreviewCard({ title, subtitle, icon, accentClass, onViewAll, children, loading, empty, emptyText }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${accentClass} border-l-4 flex flex-col`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-slate-50 rounded-xl text-slate-700">{icon}</span>
          <div>
            <p className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</p>
            <p className="text-xs font-medium text-slate-500">{subtitle}</p>
          </div>
        </div>
        <button onClick={onViewAll} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50">
          Semua <ArrowRight size={14} />
        </button>
      </div>
      <div className="px-6 py-4 flex-1">
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : empty ? (
          <div className="py-8 text-center">
            <p className="text-slate-400 text-sm font-medium">{emptyText}</p>
          </div>
        ) : children}
      </div>
    </div>
  );
}