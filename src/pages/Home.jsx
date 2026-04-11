import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, MessageSquare, Briefcase, GraduationCap,
  Repeat, Clock, ArrowRight, CheckCircle2, BookOpen, Map,
  Calendar, AlertCircle
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
  'Tinggi':   'bg-red-100 text-red-700',
  'Menengah': 'bg-yellow-100 text-yellow-800',
  'Rendah':   'bg-green-100 text-green-700',
};

export default function Home() {
  const { impersonatedUser: user } = useUser();
  const navigate = useNavigate();
  const greeting = getGreeting();

  const [todos, setTodos]           = useState([]);
  const [rutinitas, setRutinitas]   = useState([]);
  const [jadwal, setJadwal]         = useState([]);
  const [roadmaps, setRoadmaps]     = useState([]);
  const [progress, setProgress]     = useState([]);
  const [loading, setLoading]       = useState(true);

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
        if (todosRes.status === 'fulfilled')    setTodos(todosRes.value.data);
        if (rutRes.status === 'fulfilled')      setRutinitas(rutRes.value.data);
        if (jadwalRes.status === 'fulfilled')   setJadwal(jadwalRes.value.data);
        if (roadmapRes.status === 'fulfilled')  setRoadmaps(roadmapRes.value);
        if (progressRes.status === 'fulfilled') setProgress(progressRes.value);
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const activeTodos    = todos.filter(t => !t.is_completed);
  const completedTodos = todos.filter(t => t.is_completed);
  const todayJadwal    = jadwal.filter(j => j.hari === TODAY_NAME);
  const completedSteps = progress.filter(p => p.status === 'completed').length;
  const totalSteps     = progress.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-emerald-200 via-emerald-900 to-slate-900 p-8 text-emerald-950 font-bold shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-400/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-300 text-sm font-medium mb-1">{greeting.emoji} {greeting.text}</p>
            <h1 className="text-3xl font-bold mb-1">{user ? user.nama.split(' ')[0] : 'Mahasiswa'} 👋</h1>
            <p className="text-slate-300 text-sm mb-4">{user?.jurusan ? `${user.jurusan} · ` : ''}Platform AI siap membantu hari ini.</p>
            
            {/* Skill Tags */}
            {user?.keterampilan && (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.keterampilan.split(', ').map((s, idx) => {
                  const parts = s.split(' (');
                  const name = parts[0];
                  const level = parts[1] ? parts[1].replace(')', '') : null;
                  return (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-950 text-[11px] font-bold border border-white/30 shadow-sm"
                    >
                      {name}
                      {level && (
                        <span className="opacity-60 text-[9px] uppercase tracking-tighter">
                          • {level}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Tugas Aktif', value: activeTodos.length },
              { label: 'Jadwal Hari Ini', value: todayJadwal.length },
              { label: 'Progress Karir', value: totalSteps ? `${completedSteps}/${totalSteps}` : '—' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold text-emerald-950 font-bold">{s.value}</p>
                <p className="text-[11px] text-emerald-200">{s.label}</p>
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
            <div key={t.id_todo} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-300 shrink-0" />
              <p className="text-sm text-slate-700 flex-1 line-clamp-1">{t.nama}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[t.tipe] || 'bg-gray-100 text-gray-600'}`}>
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
            <div key={j.id_jadwal} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="p-1.5 rounded-lg bg-yellow-50 text-yellow-700 shrink-0">
                <BookOpen size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{j.nama}</p>
                <p className="text-[11px] text-slate-600">{j.jam_mulai?.slice(0,5)} – {j.jam_selesai?.slice(0,5)}</p>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">{j.sks} SKS</span>
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
            <div key={r.id_rutinitas} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 shrink-0">
                <Repeat size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{r.nama}</p>
                <p className="text-[11px] text-slate-600">{r.hari} · {r.jam_mulai?.slice(0,5) || '—'}</p>
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
            <div key={rm.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800 shrink-0">
                <Briefcase size={13} />
              </div>
              <p className="text-sm text-slate-700 flex-1 line-clamp-1">{rm.title}</p>
            </div>
          ))}
        </PreviewCard>

      </div>

      {/* ── Chat AI Banner ── */}
      <button
        onClick={() => navigate('/chat-ai')}
        className="w-full flex items-center justify-between gap-4 bg-emerald-300 text-emerald-950 font-bold rounded-2xl px-6 py-5 hover:from-emerald-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-xl group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <MessageSquare size={22} />
          </div>
          <div className="text-left">
            <p className="font-bold text-base">Tanya Chat AI</p>
            <p className="text-emerald-200 text-sm">Konsultasi jadwal, tugas, atau karir dengan AI pintar</p>
          </div>
        </div>
        <ArrowRight size={20} className="opacity-60 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

/* Reusable Preview Card */
function PreviewCard({ title, subtitle, icon, accentClass, onViewAll, children, loading, empty, emptyText }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${accentClass} border-l-4 flex flex-col`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-slate-50 rounded-lg">{icon}</span>
          <div>
            <p className="text-sm font-bold text-slate-800">{title}</p>
            <p className="text-[11px] text-slate-600">{subtitle}</p>
          </div>
        </div>
        <button onClick={onViewAll} className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition-colors">
          Lihat semua <ArrowRight size={12} />
        </button>
      </div>
      <div className="px-5 py-3 flex-1">
        {loading ? (
          <div className="py-6 flex justify-center">
            <div className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : empty ? (
          <p className="py-6 text-center text-slate-600 text-sm">{emptyText}</p>
        ) : children}
      </div>
    </div>
  );
}