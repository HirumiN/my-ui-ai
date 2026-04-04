import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { Save, RefreshCw } from 'lucide-react';

export default function Profile() {
  const { impersonatedUser, checkAuth } = useUser();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    bio: '',
    lokasi: '',
    calendar_name: '',
    umur: '',
    minat: '',
    keterampilan: '',
    kepribadian: '',
    target_karir: '',
    gaya_belajar: '',
    waktu_luang: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (impersonatedUser) {
      setFormData({
        nama: impersonatedUser.nama || '',
        email: impersonatedUser.email || '',
        telepon: impersonatedUser.telepon || '',
        bio: impersonatedUser.bio || '',
        lokasi: impersonatedUser.lokasi || '',
        calendar_name: impersonatedUser.calendar_name || 'My Campus',
        umur: impersonatedUser.umur || '',
        minat: impersonatedUser.minat || '',
        keterampilan: impersonatedUser.keterampilan || '',
        kepribadian: impersonatedUser.kepribadian || '',
        target_karir: impersonatedUser.target_karir || '',
        gaya_belajar: impersonatedUser.gaya_belajar || '',
        waktu_luang: impersonatedUser.waktu_luang || ''
      });
    }
  }, [impersonatedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = new URLSearchParams();
      data.append('nama', formData.nama);
      // Email usually read-only/disabled but sending it anyway or excluded if backend ignores
      data.append('email', formData.email);
      data.append('telepon', formData.telepon);
      data.append('bio', formData.bio);
      data.append('lokasi', formData.lokasi);
      data.append('calendar_name', formData.calendar_name);
      data.append('umur', formData.umur);
      data.append('minat', formData.minat);
      data.append('keterampilan', formData.keterampilan);
      data.append('kepribadian', formData.kepribadian);
      data.append('target_karir', formData.target_karir);
      data.append('gaya_belajar', formData.gaya_belajar);
      data.append('waktu_luang', formData.waktu_luang);

      // Using dataService to post to /update-user/{id}
      // Note: checkAuth() in context might need to reload user to reflect changes locally if API returns redirect. 
      // The backend /update-user returns Redirect, which axios might follow.
      // Ideally we reload the user context.

      await dataService.updateUser(impersonatedUser.id_user, data);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await checkAuth(); // Refresh user context

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (!impersonatedUser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">No user impersonated.</p>
          <p>Please go to the "Users" page to select a user to impersonate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        Edit Profile
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            ></textarea>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Personalization Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="umur"
                  value={formData.umur}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Career</label>
                <input
                  type="text"
                  name="target_karir"
                  value={formData.target_karir}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
              <textarea
                name="minat"
                value={formData.minat}
                onChange={handleChange}
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              ></textarea>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <textarea
                name="keterampilan"
                value={formData.keterampilan}
                onChange={handleChange}
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              ></textarea>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
              <textarea
                name="kepribadian"
                value={formData.kepribadian}
                onChange={handleChange}
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Style</label>
                <textarea
                  name="gaya_belajar"
                  value={formData.gaya_belajar}
                  onChange={handleChange}
                  placeholder="e.g. Visual, Audio, Kinesthetic"
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability / Time</label>
                <textarea
                  name="waktu_luang"
                  value={formData.waktu_luang}
                  onChange={handleChange}
                  placeholder="e.g. 1 hour a day, Weekends only"
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Calendar Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Name Prefix</label>
              <p className="text-xs text-gray-500 mb-2">Your calendars will be named like "{formData.calendar_name || 'My Campus'} - Ganjil 2025/2026"</p>
              <input
                type="text"
                name="calendar_name"
                value={formData.calendar_name}
                onChange={handleChange}
                placeholder="My Campus"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-70 flex items-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
