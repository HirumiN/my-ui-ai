import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const STEPS_CONFIG = [
  {
    field: 'umur',
    title: 'Berapa umur Anda?',
    subtitle: 'Membantu kami memahami tahap kehidupan Anda.',
    options: [],
    placeholder: 'Ketik umur Anda...',
    type: 'number',
    multiSelect: false
  },
  {
    field: 'target_karir',
    title: 'Apa target karir Anda?',
    subtitle: 'Rekomendasi kegiatan dan belajar akan disesuaikan untuk ini.',
    options: ['Software Engineer', 'Data Scientist', 'UI/UX Designer', 'Product Manager'],
    placeholder: 'Atau ketik sendiri... (contoh: Backend Engineer)',
    type: 'text',
    multiSelect: false
  },
  {
    field: 'minat',
    title: 'Apa saja minat atau ketertarikan Anda?',
    subtitle: 'Pilih satu atau lebih, atau tambahkan sendiri.',
    options: ['AI & Machine Learning', 'Web Development', 'Desain Grafis', 'Cybersecurity', 'Bisnis & Startup'],
    placeholder: 'Ketik minat lainnya...',
    type: 'text',
    multiSelect: true
  },
  {
    field: 'keterampilan',
    title: 'Keterampilan (Skill) apa yang Anda miliki saat ini?',
    subtitle: 'Pilih satu atau lebih, atau tambahkan sendiri.',
    options: ['Python', 'JavaScript/React', 'Figma', 'Public Speaking', 'Problem Solving'],
    placeholder: 'Sebutkan skill lainnya...',
    type: 'text',
    multiSelect: true
  },
  {
    field: 'kepribadian',
    title: 'Bagaimana Anda mendeskripsikan kepribadian Anda?',
    subtitle: 'Agar interaksi AI sesuai dengan gaya Anda.',
    options: ['Introvert', 'Ekstrovert', 'Ambivert', 'Logis & Analitis', 'Kreatif & Imajinatif'],
    placeholder: 'Atau gambarkan sendiri...',
    type: 'text',
    multiSelect: false
  },
  {
    field: 'gaya_belajar',
    title: 'Bagaimana gaya belajar yang paling cocok untuk Anda?',
    subtitle: 'Sangat penting untuk rekomendasi belajar Anda.',
    options: ['Visual (Gambar/Video)', 'Auditori (Mendengar)', 'Kinestetik (Praktek langsung)'],
    placeholder: 'Atau jelaskan kondisi ideal Anda...',
    type: 'text',
    multiSelect: false
  },
  {
    field: 'waktu_luang',
    title: 'Berapa banyak ketersediaan waktu luang Anda?',
    subtitle: 'Membantu AI menjadwalkan rekomendasi tanpa membebani jadwal padat Anda.',
    options: ['1-2 Jam Sehari', 'Hanya Akhir Pekan', 'Waktu Bebas (Full-time)', 'Jarang Ada Waktu'],
    placeholder: 'Atau ketik sendiri... (contoh: 3 jam tiap malam)',
    type: 'text',
    multiSelect: false
  }
];

export default function Onboarding({ onComplete }) {
  const { impersonatedUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
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

  const activeStepConfig = STEPS_CONFIG[currentStep];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionClick = (field, option, isMulti) => {
    setFormData(prev => {
      let currentVal = prev[field] || '';
      
      if (isMulti) {
        // Toggle selection logic for comma separated string
        let parts = currentVal ? currentVal.split(', ').filter(Boolean) : [];
        if (parts.includes(option)) {
          parts = parts.filter(p => p !== option);
        } else {
          parts.push(option);
        }
        return { ...prev, [field]: parts.join(', ') };
      } else {
        // Single selection replace
        return { ...prev, [field]: option };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new URLSearchParams();
      // Ensure all fields have fallback for impersonatedUser
      data.append('nama', impersonatedUser?.nama || '');
      data.append('email', impersonatedUser?.email || '');
      data.append('telepon', impersonatedUser?.telepon || '');
      data.append('bio', impersonatedUser?.bio || '');
      data.append('lokasi', impersonatedUser?.lokasi || '');
      
      data.append('umur', formData.umur);
      data.append('minat', formData.minat);
      data.append('keterampilan', formData.keterampilan);
      data.append('kepribadian', formData.kepribadian);
      data.append('target_karir', formData.target_karir);
      data.append('gaya_belajar', formData.gaya_belajar);
      data.append('waktu_luang', formData.waktu_luang);

      if (impersonatedUser && impersonatedUser.id_user) {
        await dataService.updateUser(impersonatedUser.id_user, data);
      }
      
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
        {/* Header and Progress indicator */}
        <div className="mb-8 text-center transition-all">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Halo, {impersonatedUser?.nama || 'User'}!</h1>
          <p className="text-gray-500 mb-6">Ceritakan tentang Anda agar AI kami bisa bertindak personal.</p>
          
          <div className="flex items-center justify-center space-x-2">
            {STEPS_CONFIG.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === idx ? 'w-8 bg-blue-600' : 
                  currentStep > idx ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Wizard Form Area */}
        <div className="min-h-[250px] flex flex-col justify-center transition-opacity duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Q{currentStep + 1}: {activeStepConfig.title}
            </h2>
            <p className="text-gray-500 text-sm">{activeStepConfig.subtitle}</p>
          </div>

          <div className="space-y-4">
            {/* Options grid */}
            <div className="flex flex-wrap gap-2">
              {activeStepConfig.options.map((option, idx) => {
                const isSelected = activeStepConfig.multiSelect 
                  ? (formData[activeStepConfig.field] || '').split(', ').includes(option)
                  : formData[activeStepConfig.field] === option;
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionClick(activeStepConfig.field, option, activeStepConfig.multiSelect)}
                    className={`px-4 py-2 border rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 ring-offset-1 transform scale-105' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Manual input fallback */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Atau Isi Sendiri:</label>
              {(activeStepConfig.type === 'number' || !activeStepConfig.multiSelect) ? (
                <input
                  type={activeStepConfig.type}
                  name={activeStepConfig.field}
                  value={formData[activeStepConfig.field]}
                  onChange={handleChange}
                  placeholder={activeStepConfig.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                />
              ) : (
                <textarea
                  name={activeStepConfig.field}
                  value={formData[activeStepConfig.field]}
                  onChange={handleChange}
                  placeholder={activeStepConfig.placeholder}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                ></textarea>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-10 border-t pt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0 || loading}
            className={`px-6 py-2.5 font-medium rounded-lg flex items-center gap-2 transition-all ${
              currentStep === 0 ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={20} /> Sebelumnya
          </button>
          
          {currentStep < STEPS_CONFIG.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Lanjut <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : (
                <>Selesai & Simpan <CheckCircle size={20} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
