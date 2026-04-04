import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import { RefreshCw, Save, Check, ArrowRight, ListTodo, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CareerAnalysis() {
  const { impersonatedUser: user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setResultData(null);
    setSaved(false);
    setError(null);
    try {
      const res = await careerService.generateAnalysis(user.id_user);
      setResultData(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Sesi API tidak valid. Jika ini akun Demo, fitur ini diblokir karena membutuhkan autentikasi Google Calendar asli.");
      } else {
        setError("Gagal menghasilkan rekomendasi karir. AI mungkin sedang sibuk.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await careerService.saveAnalysis(user.id_user, resultData);
      setSaved(true);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan hasil karir');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm" role="alert">
          <p className="font-bold mb-1">Akses Ditolak: Belum Login / Mode Demo</p>
          <p>Fitur AI Karir ini memerlukan akses ke Database dan sinkronisasi Google Calendar Anda. Jika Anda menggunakan "Demo Login", silakan <span className="font-semibold">Log Out</span> dan gunakan <span className="font-semibold">Sign in with Google</span>, atau pergi ke menu "Users" untuk melakukan *impersonate* akun yang valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Analisis & Roadmap Karir AI</h2>
      <p className="text-gray-500 mb-8">Dapatkan panduan karir dan rencana belajar otomatis berdasarkan profil rekam akademik dan aktivitas Anda!</p>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          {error}
        </div>
      )}

      
      {!resultData && (
        <div className="flex justify-center items-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : null}
            {loading ? 'AI Sedang Menganalisis...' : 'Buat Rekomendasi Karir'}
          </button>
        </div>
      )}

      {resultData && !saved && (
        <div className="space-y-8 animate-fade-in">
          {/* Career Box */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-4 sm:text-left text-center">{resultData.career?.name}</h3>
            <p className="text-gray-700 leading-relaxed text-base">{resultData.career?.reason}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-green-100 shadow-sm">
                <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">💪</span> 
                  Kekuatan Utama
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {(resultData.career?.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-orange-100 shadow-sm">
                <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🎯</span> 
                  Area Pengembangan
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {(resultData.career?.weaknesses || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-blue-800 text-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center shrink-0">💡</div>
             <div>
                <p className="font-bold mb-1">Pratinjau Berhasil Dibuat!</p>
                <p>AI telah menyusun <strong>{resultData.roadmap?.length || 0} Fase Roadmap</strong> dan <strong>{resultData.tasks?.length || 0} Tugas (Todolist)</strong> khusus untuk Anda. Simpan ke profil untuk mulai menjalankan rencana ini.</p>
             </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 justify-end items-center">
             <button 
                onClick={handleGenerate} 
                disabled={loading || saveLoading}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 disabled:bg-gray-100 transition shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Batalkan & Buat Ulang
              </button>

            <button 
              onClick={handleSave} 
              disabled={saveLoading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl shadow-md font-medium transition text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70"
            >
              {saveLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saveLoading ? 'Menyimpan...' : 'Simpan ke Profil'}
            </button>
          </div>
        </div>
      )}

      {resultData && saved && (
        <div className="py-10 text-center animate-fade-in">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <Check size={40} className="stroke-[3]" />
           </div>
           <h3 className="text-3xl font-bold text-gray-800 mb-4">Rencana Karir Tersimpan!</h3>
           <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">Semua langkah Roadmap dan daftar Tugas (Todo) telah ditambahkan ke akun dan Google Calendar Anda.</p>
           
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/roadmap')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-3 text-lg"
              >
                <Map size={24} /> Lihat Detail Roadmap
              </button>
              <button 
                onClick={() => navigate('/todos')}
                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-md transition flex items-center justify-center gap-3 text-lg"
              >
                <ListTodo size={24} /> Buka Todolist <ArrowRight size={20} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
