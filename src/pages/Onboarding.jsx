import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { ChevronRight } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const { impersonatedUser } = useUser();
  const [formData, setFormData] = useState({
    umur: '',
    minat: '',
    keterampilan: '',
    kepribadian: '',
    target_karir: '',
    gaya_belajar: '',
    waktu_luang: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new URLSearchParams();
      data.append('nama', impersonatedUser.nama);
      data.append('email', impersonatedUser.email);
      // Optional defaults
      data.append('telepon', impersonatedUser.telepon || '');
      data.append('bio', impersonatedUser.bio || '');
      data.append('lokasi', impersonatedUser.lokasi || '');
      
      // New profile fields
      data.append('umur', formData.umur);
      data.append('minat', formData.minat);
      data.append('keterampilan', formData.keterampilan);
      data.append('kepribadian', formData.kepribadian);
      data.append('target_karir', formData.target_karir);
      data.append('gaya_belajar', formData.gaya_belajar);
      data.append('waktu_luang', formData.waktu_luang);

      await dataService.updateUser(impersonatedUser.id_user, data);
      
      // Tell App that onboarding is done
      onComplete();

    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white max-w-2xl w-full shadow-2xl rounded-2xl p-8 md:p-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold border-b-2 inline-block border-blue-500 pb-2 mb-4 text-gray-800">Selamat Datang, {impersonatedUser?.nama}!</h1>
          <p className="text-gray-600">Sebelum mulai, ceritakan sedikit tentang diri Anda agar AI kami bisa memberikan rekomendasi dan layanan yang paling personal untuk Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Umur</label>
              <input
                type="number"
                name="umur"
                value={formData.umur}
                onChange={handleChange}
                placeholder="20"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Karir (Opsional)</label>
              <input
                type="text"
                name="target_karir"
                value={formData.target_karir}
                onChange={handleChange}
                placeholder="Contoh: Software Engineer, Data Scientist"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minat (Interests)</label>
            <textarea
              name="minat"
              value={formData.minat}
              onChange={handleChange}
              placeholder="Ceritakan ketertarikan Anda, contoh: AI, Web Development, Design, dll"
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterampilan (Skills)</label>
            <textarea
              name="keterampilan"
              value={formData.keterampilan}
              onChange={handleChange}
              placeholder="Sebutkan skill yang Anda miliki saat ini. Contoh: Python, React, Public Speaking"
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kepribadian</label>
            <textarea
              name="kepribadian"
              value={formData.kepribadian}
              onChange={handleChange}
              placeholder="Gambarkan gaya belajar/kepribadian Anda. (Misal: Introvert, suka belajar visual, MBTI ENTJ)"
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gaya Belajar</label>
              <textarea
                name="gaya_belajar"
                value={formData.gaya_belajar}
                onChange={handleChange}
                placeholder="Contoh: Visual (lewat video), Auditory, Praktek"
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan Waktu (Waktu Luang)</label>
              <textarea
                name="waktu_luang"
                value={formData.waktu_luang}
                onChange={handleChange}
                placeholder="Contoh: 1-2 Jam Sehari, Hanya Akhir Pekan, Full-time"
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                required
              ></textarea>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-all w-full md:w-auto"
            >
              {loading ? 'Menyimpan...' : (
                <>Lanjut <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
