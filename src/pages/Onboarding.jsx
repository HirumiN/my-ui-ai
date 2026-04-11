import React, { useState, useEffect } from 'react';
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
    field: 'universitas',
    title: 'Di mana Kampus / Tempat Studi Anda?',
    subtitle: 'Nama institusi pendidikan saat ini (Hanya pilihan tersedia).',
    options: [],
    placeholder: 'Pilih Universitas...',
    type: 'restricted',
    multiSelect: false
  },
  {
    field: 'jurusan',
    title: 'Apa Jurusan / Program Studi Anda?',
    subtitle: 'Hanya pilihan tersedia untuk sinkronisasi kurikulum.',
    options: [],
    placeholder: 'Pilih jurusan Anda...',
    type: 'restricted',
    multiSelect: false
  },
  {
    field: 'semester_sekarang',
    title: 'Semester berapa Anda saat ini?',
    subtitle: 'Penyesuaian rekomendasi tugas dan aktivitas berdasarkan kurikulum.',
    options: ['1', '2', '3', '4', '5', '6', '7', '8'],
    placeholder: 'Sebutkan spesifik, contoh: 9',
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
    field: 'tingkat_keterampilan',
    title: 'Level Mahir (Skill Level)',
    subtitle: 'Beri tingkatan pada skill yang baru saja Anda pilih.',
    options: ['Pemula', 'Menengah', 'Lanjutan'],
    type: 'custom_skill_level',
    multiSelect: false
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
    universitas: '',
    jurusan: '',
    semester_sekarang: '',
    minat: '',
    keterampilan: '',
    keterampilan_levels: {},
    kepribadian: '',
    target_karir: '',
    gaya_belajar: '',
    waktu_luang: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState(null);

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await dataService.getCampuses();
        setCampuses(res.data);
      } catch (err) {
        console.error("Failed to fetch campuses", err);
      }
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (selectedCampusId) {
      const fetchDepts = async () => {
        try {
          const res = await dataService.getDepartments(selectedCampusId);
          setDepartments(res.data);
        } catch (err) {
          console.error("Failed to fetch departments", err);
        }
      };
      fetchDepts();
    }
  }, [selectedCampusId]);

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
    setCustomInput(''); // Reset custom input between steps
    if (currentStep < STEPS_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCustomInput(''); // Reset custom input
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
      data.append('universitas', formData.universitas);
      data.append('jurusan', formData.jurusan);
      data.append('semester_sekarang', formData.semester_sekarang);
      data.append('minat', formData.minat);

      // Format keterampilan with levels mapping
      let finalKeterampilan = formData.keterampilan;
      if (finalKeterampilan) {
        const skillsArray = finalKeterampilan.split(', ').filter(Boolean);
        const mappedSkills = skillsArray.map(skill => {
          const level = formData.keterampilan_levels[skill];
          return level ? `${skill} (${level})` : skill;
        });
        finalKeterampilan = mappedSkills.join(', ');
      }
      data.append('keterampilan', finalKeterampilan);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8">
      <div className="bg-white max-w-6xl w-full shadow-2xl rounded-3xl p-10 md:p-16">
        {/* Header and Progress indicator */}
        <div className="mb-12 text-center transition-all">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Halo, {impersonatedUser?.nama || 'User'}!</h1>
          <p className="text-gray-500 mb-6">Ceritakan tentang Anda agar AI kami bisa bertindak personal.</p>

          <div className="flex items-center justify-center space-x-2">
            {STEPS_CONFIG.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${currentStep === idx ? 'w-8 bg-blue-600' :
                  currentStep > idx ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'
                  }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Wizard Form Area */}
        <div className="min-h-[450px] flex flex-col justify-center transition-opacity duration-300">
          <div className="mb-8">
            <h2 className="text-4xl font-semibold text-gray-800 mb-3">
              Q{currentStep + 1}: {activeStepConfig.title}
            </h2>
            <p className="text-gray-500 md:text-lg">{activeStepConfig.subtitle}</p>
          </div>

          <div className="space-y-6">
            {/* Options grid */}
            {activeStepConfig.type === 'custom_skill_level' ? (
              <div className="space-y-4 mt-2">
                {(!formData.keterampilan || formData.keterampilan.trim() === '') ? (
                  <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center border">Anda belum memasukkan skill di tahapan sebelumnya.</p>
                ) : (
                  formData.keterampilan.split(', ').filter(Boolean).map((skill, sIdx) => (
                    <div key={sIdx} className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-blue-500">
                      <h3 className="font-semibold text-gray-800 mb-3">{skill}</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeStepConfig.options.map((lvl, lIdx) => {
                          const isSel = formData.keterampilan_levels[skill] === lvl;
                          return (
                            <button
                              key={lIdx}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  keterampilan_levels: {
                                    ...prev.keterampilan_levels,
                                    [skill]: lvl
                                  }
                                }))
                              }}
                              className={`px-4 py-1.5 border rounded-full text-sm font-medium transition-all ${isSel ? 'bg-blue-600 text-white border-blue-600 shadow ring-2 ring-blue-300' : 'bg-gray-50 text-gray-600 hover:bg-blue-50 border-gray-300'}`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* 1. Predefined/Dynamic options */}
                {(activeStepConfig.type === 'restricted' 
                  ? (activeStepConfig.field === 'universitas' ? campuses.map(c => c.name) : departments.map(d => d.name))
                  : activeStepConfig.options
                ).map((option, idx) => {
                  const isSelected = activeStepConfig.multiSelect
                    ? (formData[activeStepConfig.field] || '').split(', ').includes(option)
                    : formData[activeStepConfig.field] === option;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleOptionClick(activeStepConfig.field, option, activeStepConfig.multiSelect);
                        if (activeStepConfig.field === 'universitas') {
                          const campus = campuses.find(c => c.name === option);
                          if (campus) setSelectedCampusId(campus.id);
                        }
                      }}
                      className={`px-5 py-3 border rounded-full md:text-base font-medium transition-all duration-200 ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-4 ring-blue-200 ring-offset-2 transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Manual input fallback - Hide for restricted types */}
            {activeStepConfig.type !== 'custom_skill_level' && activeStepConfig.type !== 'restricted' && (
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Atau Isi Sendiri:</label>
                {(activeStepConfig.type === 'number' || !activeStepConfig.multiSelect) ? (
                  <input
                    type={activeStepConfig.type}
                    name={activeStepConfig.field}
                    value={formData[activeStepConfig.field]}
                    onChange={handleChange}
                    placeholder={activeStepConfig.placeholder}
                    className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800 md:text-lg shadow-inner"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          if (customInput.trim()) {
                            const currentStr = formData[activeStepConfig.field] || '';
                            const parts = currentStr ? currentStr.split(', ').filter(Boolean) : [];
                            if (!parts.includes(customInput.trim())) {
                              setFormData({ ...formData, [activeStepConfig.field]: [...parts, customInput.trim()].join(', ') });
                            }
                            setCustomInput('');
                          }
                        }
                      }}
                      placeholder="Ketik lalu Tambah..."
                      className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customInput.trim()) {
                          const currentStr = formData[activeStepConfig.field] || '';
                          const parts = currentStr ? currentStr.split(', ').filter(Boolean) : [];
                          if (!parts.includes(customInput.trim())) {
                            setFormData({ ...formData, [activeStepConfig.field]: [...parts, customInput.trim()].join(', ') });
                          }
                          setCustomInput('');
                        }
                      }}
                      className="px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 border transition-all"
                    >
                      Tambah
                    </button>
                  </div>
                )}
              </div>
            )}
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
            className={`px-6 py-2.5 font-medium rounded-lg flex items-center gap-2 transition-all ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
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
