import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Search, 
  Database, 
  Plus, 
  Globe, 
  GraduationCap,
  Sparkles
} from 'lucide-react';

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
    title: 'Di mana Kampus Anda?',
    subtitle: 'Pilih institusi Anda untuk sinkronisasi kurikulum otomatis.',
    options: [],
    placeholder: 'Cari Universitas...',
    type: 'searchable_select',
    multiSelect: false
  },
  {
    field: 'jurusan',
    title: 'Apa Jurusan Anda?',
    subtitle: 'Pilih program studi Anda berdasarkan data kurikulum.',
    options: [],
    placeholder: 'Cari Jurusan...',
    type: 'searchable_select',
    multiSelect: false
  },
  {
    field: 'semester_sekarang',
    title: 'Semester berapa Anda?',
    subtitle: 'Maksimal semester 8.',
    options: [],
    placeholder: 'Contoh: 1',
    type: 'number',
    max: 8,
    multiSelect: false
  },
  {
    field: 'target_karir',
    title: 'Apa target karir Anda?',
    subtitle: 'Rekomendasi karir dan belajar akan disesuaikan.',
    options: ['Pebisnis / Wirausaha', 'Desainer / Kreator Konten', 'Manajer / Eksekutif', 'Akademisi / Peneliti', 'Spesialis Teknologi'],
    placeholder: 'Atau ketik sendiri...',
    type: 'text',
    multiSelect: false
  },
  {
    field: 'minat',
    title: 'Apa minat Anda?',
    subtitle: 'Pilih minat Anda atau tambahkan sendiri.',
    options: ['Teknologi & Inovasi', 'Seni & Industri Kreatif', 'Bisnis & Pengembangan Diri', 'Sosial, Komunikasi & Bahasa', 'Sains, Riset & Lingkungan'],
    placeholder: 'Ketik minat lainnya...',
    type: 'text',
    multiSelect: true
  },
  {
    field: 'keterampilan',
    title: 'Keterampilan apa yang Anda miliki?',
    subtitle: 'Daftar skill utama Anda saat ini.',
    options: ['Komunikasi & Public Speaking', 'Manajemen Waktu & Organisasi', 'Desain Kreatif & Multimedia', 'Analisis Data & Riset', 'Pemikiran Kritis & Problem Solving'],
    placeholder: 'Sebutkan skill lainnya...',
    type: 'text',
    multiSelect: true
  },
  {
    field: 'tingkat_keterampilan',
    title: 'Seberapa mahir Anda?',
    subtitle: 'Beri tingkatan pada skill yang dipilih.',
    options: ['Pemula', 'Menengah', 'Lanjutan'],
    type: 'custom_skill_level',
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
    target_karir: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [extraInput, setExtraInput] = useState('');
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [isCampusManual, setIsCampusManual] = useState(false);
  const [isDeptManual, setIsDeptManual] = useState(false);

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

  const filteredOptions = useMemo(() => {
    if (activeStepConfig.type !== 'searchable_select') return [];
    const source = activeStepConfig.field === 'universitas' ? campuses : departments;
    return source.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeStepConfig, campuses, departments, searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionClick = (field, option, isMulti) => {
    setFormData(prev => {
      let currentVal = prev[field] || '';
      if (isMulti) {
        let parts = currentVal ? currentVal.split(', ').filter(Boolean) : [];
        if (parts.includes(option)) {
          parts = parts.filter(p => p !== option);
        } else {
          parts.push(option);
        }
        return { ...prev, [field]: parts.join(', ') };
      } else {
        return { ...prev, [field]: option };
      }
    });
  };

  const handleNext = () => {
    setSearchQuery('');
    setExtraInput('');
    if (currentStep < STEPS_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setSearchQuery('');
    setExtraInput('');
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
      data.append('target_karir', formData.target_karir);

      if (impersonatedUser?.id_user) {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-3 sm:p-6 md:p-8">
      <div className="bg-white max-w-5xl w-full shadow-xl shadow-emerald-900/5 rounded-3xl md:rounded-[3rem] p-5 sm:p-8 md:p-16 relative overflow-hidden border border-slate-100">

        {/* Progress header */}
        <div className="relative z-10 mb-6 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Sparkles size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                Step {currentStep + 1} of {STEPS_CONFIG.length}
              </span>
            </div>
            <div className="flex gap-1 md:gap-1.5 overflow-x-auto py-1">
              {STEPS_CONFIG.map((_, idx) => (
                <div key={idx} className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${
                  currentStep === idx ? 'w-6 sm:w-8 bg-emerald-600' : currentStep > idx ? 'w-2 sm:w-4 bg-emerald-300' : 'w-2 sm:w-4 bg-gray-100'
                }`} />
              ))}
            </div>
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {activeStepConfig.title}
          </h1>
          <p className="text-gray-500 text-xs sm:text-lg mt-2 md:mt-3 max-w-2xl">
            {activeStepConfig.subtitle}
          </p>
        </div>

        {/* Form Content */}
        <div className="relative z-10 min-h-[380px]">
          {activeStepConfig.type === 'searchable_select' ? (
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <Search size={18} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <input
                  type="text"
                  placeholder={activeStepConfig.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm sm:text-xl text-gray-800 font-medium placeholder:text-gray-400 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[260px] sm:max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Database Options */}
                {filteredOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleOptionClick(activeStepConfig.field, item.name, false);
                      if (activeStepConfig.field === 'universitas') {
                        setSelectedCampusId(item.id);
                        setIsCampusManual(false);
                      } else {
                        setIsDeptManual(false);
                      }
                      setSearchQuery('');
                    }}
                    className={`flex items-center justify-between p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all ${
                      formData[activeStepConfig.field] === item.name
                        ? 'bg-emerald-50 border-emerald-600 shadow-md transform scale-[1.01]'
                        : 'bg-white border-gray-50 hover:border-emerald-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${formData[activeStepConfig.field] === item.name ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {activeStepConfig.field === 'universitas' ? <Globe size={16} className="sm:w-5 sm:h-5" /> : <GraduationCap size={16} className="sm:w-5 sm:h-5" />}
                      </div>
                      <span className={`text-sm sm:text-lg font-semibold truncate ${formData[activeStepConfig.field] === item.name ? 'text-emerald-900' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                    </div>
                    {formData[activeStepConfig.field] === item.name ? (
                      <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider shrink-0 animate-in fade-in zoom-in duration-300">
                        <Database size={10} className="sm:w-3 sm:h-3" />
                        Kurikulum Terhubung
                      </div>
                    ) : (
                      <div className="text-gray-300 shrink-0">
                        <Database size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                  </button>
                ))}

                {/* Manual Input Fallback */}
                {searchQuery && !filteredOptions.some(o => o.name.toLowerCase() === searchQuery.toLowerCase()) && (
                  <button
                    onClick={() => {
                      handleOptionClick(activeStepConfig.field, searchQuery, false);
                      if (activeStepConfig.field === 'universitas') {
                        setIsCampusManual(true);
                        setSelectedCampusId(null);
                        setDepartments([]);
                      } else {
                        setIsDeptManual(true);
                      }
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-gray-500 hover:text-emerald-600 group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-emerald-100 transition-colors shrink-0">
                      <Plus size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-sm sm:text-lg font-medium italic truncate">Gunakan "{searchQuery}" (Manual)</span>
                  </button>
                )}
              </div>
              
              {/* Selected Badge for Manual */}
              {(activeStepConfig.field === 'universitas' ? isCampusManual : isDeptManual) && formData[activeStepConfig.field] && (
                 <div className="mt-4 p-3.5 sm:p-5 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                       <Plus className="text-amber-500 shrink-0" size={18} />
                       <span className="font-semibold text-sm sm:text-base text-amber-900">{formData[activeStepConfig.field]} (Manual)</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Kurikulum Tidak Terhubung</span>
                 </div>
              )}
            </div>
          ) : activeStepConfig.type === 'custom_skill_level' ? (
            <div className="space-y-3 sm:space-y-4">
              {(!formData.keterampilan || formData.keterampilan.trim() === '') ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center">
                  <p className="text-gray-400 text-sm sm:text-lg">Anda belum menambahkan skill apapun.</p>
                </div>
              ) : (
                formData.keterampilan.split(', ').filter(Boolean).map((skill, sIdx) => (
                  <div key={sIdx} className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800">{skill}</h3>
                    <div className="flex gap-1.5 sm:gap-2">
                      {activeStepConfig.options.map((lvl, lIdx) => {
                        const isSel = formData.keterampilan_levels[skill] === lvl;
                        return (
                          <button
                            key={lIdx}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              keterampilan_levels: { ...prev.keterampilan_levels, [skill]: lvl }
                            }))}
                            className={`flex-1 sm:flex-none px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                              isSel ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
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
            <div className="space-y-6 sm:space-y-8">
              {/* Multi-select or Text/Number */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {activeStepConfig.options.map((option, idx) => {
                  const isSelected = activeStepConfig.multiSelect
                    ? (formData[activeStepConfig.field] || '').split(', ').includes(option)
                    : formData[activeStepConfig.field] === option;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(activeStepConfig.field, option, activeStepConfig.multiSelect)}
                      className={`px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-bold transition-all duration-300 ${
                        isSelected 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 transform scale-102' 
                        : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 sm:space-y-4 pt-4 border-t border-gray-50">
                <label className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">Atau ketik sendiri:</label>
                {!activeStepConfig.multiSelect || activeStepConfig.type === 'number' ? (
                  <input
                    type={activeStepConfig.type}
                    name={activeStepConfig.field}
                    value={formData[activeStepConfig.field]}
                    onChange={handleChange}
                    min={activeStepConfig.min}
                    max={activeStepConfig.max}
                    placeholder={activeStepConfig.placeholder}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm sm:text-xl text-gray-800 font-medium shadow-sm"
                  />
                ) : (
                  <div className="relative group">
                    <input
                      type="text"
                      value={extraInput}
                      onChange={(e) => setExtraInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          if (extraInput.trim()) {
                            const cur = formData[activeStepConfig.field] || '';
                            const parts = cur ? cur.split(', ').filter(Boolean) : [];
                            if (!parts.includes(extraInput.trim())) {
                              setFormData({ ...formData, [activeStepConfig.field]: [...parts, extraInput.trim()].join(', ') });
                            }
                            setExtraInput('');
                          }
                        }
                      }}
                      placeholder={activeStepConfig.placeholder}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl pl-4 sm:pl-6 pr-24 py-3 sm:py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm sm:text-xl text-gray-800 font-medium shadow-sm"
                    />
                    <button 
                      onClick={() => {
                        if (extraInput.trim()) {
                          const cur = formData[activeStepConfig.field] || '';
                          const parts = cur ? cur.split(', ').filter(Boolean) : [];
                          if (!parts.includes(extraInput.trim())) {
                            setFormData({ ...formData, [activeStepConfig.field]: [...parts, extraInput.trim()].join(', ') });
                          }
                          setExtraInput('');
                        }
                      }}
                      className="absolute right-2 top-2 bottom-2 px-4 sm:px-6 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-wide hover:bg-emerald-700 transition-colors"
                    >
                      TAMBAH
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="relative z-10 flex flex-row justify-between items-center mt-8 sm:mt-16 pt-6 sm:pt-8 border-t-2 border-gray-50 gap-2 sm:gap-4 w-full">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || loading}
            className={`group px-3 sm:px-8 py-2.5 sm:py-4 font-bold rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-3 transition-all text-xs sm:text-base ${
              currentStep === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform sm:w-6 sm:h-6" /> 
            SEBELUMNYA
          </button>

          <div className="hidden sm:flex flex-1 justify-center items-center">
             <span className="text-gray-300 font-black text-2xl tracking-[0.5em] ml-[0.5em] select-none">
                CAMPU<span>S</span> AI
             </span>
          </div>

          {currentStep < STEPS_CONFIG.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 sm:px-12 py-2.5 sm:py-4 bg-emerald-600 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-1.5 sm:gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-base"
            >
              LANJUT <ChevronRight size={18} className="sm:w-6 sm:h-6" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 sm:px-12 py-2.5 sm:py-4 bg-emerald-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-1.5 sm:gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-xs sm:text-base"
            >
              {loading ? 'MENYIMPAN...' : <><CheckCircle size={18} className="sm:w-6 sm:h-6" /> SELESAI</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
