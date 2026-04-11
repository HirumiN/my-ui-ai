import React, { useEffect, useState } from 'react';
import careerService from '../services/careerService';
import { TrendingUp, Star, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';

function ProgressBar({ value }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const color = value >= 70 ? 'bg-emerald-400' : value >= 30 ? 'bg-yellow-400' : 'bg-rose-400';
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function SkillGapPanel({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const fetchGap = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const res = await careerService.getSkillGap();
      setData(res);
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        setAuthError(true);
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGap(); }, [refreshKey]);

  if (loading) return (
    <div className="flex justify-center items-center py-16">
      <RefreshCw className="animate-spin text-emerald-400" size={28} />
    </div>
  );

  if (authError) return (
    <div className="text-center py-16 bg-rose-50 rounded-xl border border-dashed border-rose-200">
      <AlertCircle size={36} className="mx-auto text-rose-400 mb-3" />
      <p className="text-rose-600 font-medium">Sesi tidak valid atau telah berakhir.</p>
      <p className="text-rose-400 text-sm mt-1">Silakan logout dan login ulang dengan Google.</p>
    </div>
  );

  if (!data || !data.skills || data.skills.length === 0) return (
    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
      <Star size={36} className="mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500 font-medium">Belum ada data skill gap.</p>
      <p className="text-slate-400 text-sm mt-1">Lengkapi keterampilan di profil atau buat roadmap karir agar analisa muncul.</p>
    </div>
  );

  const totalSkills = data.skills.length;
  const mastered = data.skills.filter(s => s.gap_pct >= 100).length;
  const avgGap = Math.round(data.skills.reduce((s, x) => s + x.gap_pct, 0) / totalSkills);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Target Karir</p>
            <p className="font-bold text-emerald-900 text-lg leading-tight">{data.target_karir}</p>
          </div>
        </div>
        <div className="flex gap-6 ml-auto">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-700">{avgGap}%</p>
            <p className="text-xs text-slate-500">Rata-rata progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-700">{mastered}/{totalSkills}</p>
            <p className="text-xs text-slate-500">Skill dikuasai</p>
          </div>
        </div>
      </div>

      {/* Skill List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.skills.map((skill) => (
          <div key={skill.skill} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{skill.skill}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  {skill.level_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`font-bold ${skill.level_name === 'Pemula' ? 'text-slate-500' : 'text-emerald-600'}`}>
                  {skill.progress_pct}%
                </span>
                {skill.progress_pct < 100 && (
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    Progress ke {skill.next_level_name}
                  </span>
                )}
                {skill.level_name === 'Master' && (
                  <span className="text-emerald-600 text-xs font-semibold">✓ Maksimal</span>
                )}
              </div>
            </div>
            <ProgressBar value={skill.progress_pct} />
            <p className="text-xs text-slate-400 mt-1.5">{skill.current_xp} XP terkumpul</p>
          </div>
        ))}
      </div>
    </div>
  );
}
