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
    options: ['Software Engineer', 'Data Scientist', 'UI/UX Designer', 'Product Manager'],
    placeholder: 'Atau ketik sendiri...',
    type: 'text',
    multiSelect: false
  },
  {
    field: 'minat',
    title: 'Apa minat Anda?',
    subtitle: 'Pilih minat Anda atau tambahkan sendiri.',
    options: ['AI & Machine Learning', 'Web Development', 'Desain Grafis', 'Cybersecurity', 'Bisnis & Startup'],
    placeholder: 'Ketik minat lainnya...',
    type: 'text',
    multiSelect: true
  },
  {
    field: 'keterampilan',
    title: 'Keterampilan apa yang Anda miliki?',
    subtitle: 'Daftar skill utama Anda saat ini.',
    options: ['Python', 'JavaScript/React', 'Figma', 'Public Speaking', 'Problem Solving'],
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="bg-white max-w-5xl w-full shadow-xl shadow-emerald-900/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden border border-slate-100">

        {/* Progress header */}
        <div className="relative z-10 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Sparkles size={20} />
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Step {currentStep + 1} of {STEPS_CONFIG.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {STEPS_CONFIG.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentStep === idx ? 'w-8 bg-emerald-600' : currentStep > idx ? 'w-4 bg-emerald-300' : 'w-4 bg-gray-100'
                }`} />
              ))}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {activeStepConfig.title}
          </h1>
          <p className="text-gray-500 text-lg mt-3 max-w-2xl">
            {activeStepConfig.subtitle}
          </p>
        </div>

        {/* Form Content */}
        <div className="relative z-10 min-h-[380px]">
          {activeStepConfig.type === 'searchable_select' ? (
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  placeholder={activeStepConfig.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-14 pr-6 py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-xl text-gray-800 font-medium placeholder:text-gray-400 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
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
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      formData[activeStepConfig.field] === item.name
                        ? 'bg-emerald-50 border-emerald-600 shadow-md transform scale-[1.01]'
                        : 'bg-white border-gray-50 hover:border-emerald-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${formData[activeStepConfig.field] === item.name ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {activeStepConfig.field === 'universitas' ? <Globe size={20} /> : <GraduationCap size={20} />}
                      </div>
                      <span className={`text-lg font-semibold ${formData[activeStepConfig.field] === item.name ? 'text-emerald-900' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                    </div>
                    {formData[activeStepConfig.field] === item.name ? (
                      <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-300">
                        <Database size={12} />
                        Kurikulum Terhubung
                      </div>
                    ) : (
                      <div className="text-gray-300">
                        <Database size={18} />
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
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-gray-500 hover:text-emerald-600 group"
                  >
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                      <Plus size={20} />
                    </div>
                    <span className="text-lg font-medium italic">Gunakan "{searchQuery}" (Manual)</span>
                  </button>
                )}
              </div>
              
              {/* Selected Badge for Manual */}
              {(activeStepConfig.field === 'universitas' ? isCampusManual : isDeptManual) && formData[activeStepConfig.field] && (
                 <div className="mt-4 p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Plus className="text-amber-500" size={20} />
                       <span className="font-semibold text-amber-900">{formData[activeStepConfig.field]} (Manual)</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 uppercase">Kurikulum Tidak Terhubung</span>
                 </div>
              )}
            </div>
          ) : activeStepConfig.type === 'custom_skill_level' ? (
            <div className="space-y-4">
              {(!formData.keterampilan || formData.keterampilan.trim() === '') ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
                  <p className="text-gray-400 text-lg">Anda belum menambahkan skill apapun.</p>
                </div>
              ) : (
                formData.keterampilan.split(', ').filter(Boolean).map((skill, sIdx) => (
                  <div key={sIdx} className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-800">{skill}</h3>
                    <div className="flex gap-2">
                      {activeStepConfig.options.map((lvl, lIdx) => {
                        const isSel = formData.keterampilan_levels[skill] === lvl;
                        return (
                          <button
                            key={lIdx}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              keterampilan_levels: { ...prev.keterampilan_levels, [skill]: lvl }
                            }))}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                              isSel ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
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
            <div className="space-y-8">
              {/* Multi-select or Text/Number */}
              <div className="flex flex-wrap gap-3">
                {activeStepConfig.options.map((option, idx) => {
                  const isSelected = activeStepConfig.multiSelect
                    ? (formData[activeStepConfig.field] || '').split(', ').includes(option)
                    : formData[activeStepConfig.field] === option;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(activeStepConfig.field, option, activeStepConfig.multiSelect)}
                      className={`px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 ${
                        isSelected 
                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 transform scale-105' 
                        : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Atau ketik sendiri:</label>
                {!activeStepConfig.multiSelect || activeStepConfig.type === 'number' ? (
                  <input
                    type={activeStepConfig.type}
                    name={activeStepConfig.field}
                    value={formData[activeStepConfig.field]}
                    onChange={handleChange}
                    min={activeStepConfig.min}
                    max={activeStepConfig.max}
                    placeholder={activeStepConfig.placeholder}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-xl text-gray-800 font-medium shadow-sm"
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
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-6 pr-24 py-5 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-xl text-gray-800 font-medium shadow-sm"
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
                      className="absolute right-3 top-3 bottom-3 px-6 bg-emerald-600 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-emerald-700 transition-colors"
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
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center mt-16 pt-8 border-t-2 border-gray-50 gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || loading}
            className={`group px-8 py-4 font-bold rounded-2xl flex items-center gap-3 transition-all ${
              currentStep === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> 
            SEBELUMNYA
          </button>

          <div className="flex-1 flex justify-center items-center">
             <span className="text-gray-300 font-black text-2xl tracking-[0.5em] ml-[0.5em] select-none">
                CAMPU<span>S</span> AI
             </span>
          </div>

          {currentStep < STEPS_CONFIG.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              LANJUT <ChevronRight size={24} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? 'MENYIMPAN...' : <><CheckCircle size={24} /> SELESAI</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
