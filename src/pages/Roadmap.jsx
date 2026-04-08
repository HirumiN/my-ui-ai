import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import { Map, CheckCircle, Clock, MapPin, Target, ChevronRight, Trash2, X } from 'lucide-react';

export default function Roadmap() {
  const { impersonatedUser: user } = useUser();
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [activePopupPhase, setActivePopupPhase] = useState(null);

  const fetchRoadmaps = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await careerService.getRoadmaps();
      setRoadmaps(data);
      if (data.length > 0) {
        setActiveRoadmapId(data[data.length - 1].id); // Select the latest roadmap
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!activeRoadmapId) return;
      setStepsLoading(true);
      try {
        const [stepsRes, progressRes] = await Promise.all([
          careerService.getRoadmapSteps(activeRoadmapId),
          careerService.getCareerProgress()
        ]);
        setSteps(stepsRes);
        setProgressData(progressRes);
      } catch (error) {
        console.error(error);
      } finally {
        setStepsLoading(false);
      }
    };
    fetchDetails();
  }, [activeRoadmapId]);

  const toggleProgress = async (progressId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await careerService.updateCareerProgress(progressId, newStatus);
      setProgressData(prev => prev.map(p => p.id === progressId ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error('Gagal memperbarui progress', error);
    }
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus peta karir ini secara permanen?")) return;
    try {
      setLoading(true);
      await careerService.deleteRoadmap(roadmapId);
      const updatedRoadmaps = roadmaps.filter(r => r.id !== roadmapId);
      setRoadmaps(updatedRoadmaps);
      if (activeRoadmapId === roadmapId) {
        setActiveRoadmapId(updatedRoadmaps.length > 0 ? updatedRoadmaps[updatedRoadmaps.length - 1].id : null);
        setSteps([]);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus roadmap.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm" role="alert">
          <p className="font-bold mb-1">Akses Ditolak: Belum Login / Mode Demo</p>
          <p>Silakan <strong>Sign in with Google</strong> untuk melihat Roadmap Anda.</p>
        </div>
      </div>
    );
  }

  // Group steps by Phase
  const stepsByPhase = steps.reduce((acc, step) => {
    if (!acc[step.phase]) acc[step.phase] = [];
    acc[step.phase].push(step);
    return acc;
  }, {});

  return (
    <div className="w-full h-full pb-10">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Alur Pembelajaran
          </h2>
          <p className="text-gray-500 mt-1">Jalur Node-Graph bertahap untuk mencapai karir impian Anda.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Clock className="animate-spin text-gray-400" size={32} /></div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Target className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-700">Belum Ada Roadmap</h3>
          <p className="text-gray-500 mt-2 mb-6">Anda belum pernah menyimpan Peta Karir (Roadmap) dari AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Roadmap List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-fit">
            <h3 className="font-bold text-gray-700 mb-4 px-2 uppercase tracking-wider text-xs">Peta Karir Anda</h3>
            <div className="space-y-2">
              {roadmaps.map(rm => (
                <div key={rm.id} className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all group ${activeRoadmapId === rm.id ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                  <button
                    onClick={() => setActiveRoadmapId(rm.id)}
                    className="flex items-center gap-3 w-full"
                  >
                    <MapPin size={18} className={activeRoadmapId === rm.id ? 'text-indigo-600' : 'text-gray-400'} />
                    <span className={`font-medium text-sm line-clamp-2 text-left ${activeRoadmapId === rm.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {rm.title}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteRoadmap(rm.id); }}
                    className="p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-md transition-all shrink-0 cursor-pointer z-10 relative"
                    title="Hapus Roadmap"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Selected Roadmap */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 border border-indigo-100 rounded-2xl p-10 shadow-sm min-h-[600px] flex justify-center">

              {stepsLoading ? (
                <div className="flex justify-center p-12 w-full"><Clock className="animate-spin text-indigo-400" size={32} /></div>
              ) : (
                <div className="flex flex-col items-center w-full relative pt-4">
                  {Object.entries(stepsByPhase).map(([phase, phaseSteps], index) => {
                    const isCompleted = phaseSteps.every(step => {
                      const p = progressData.find(pr => pr.id_roadmap_step === step.id);
                      return p?.status === 'completed';
                    });

                    return (
                      <div key={phase} className="relative flex justify-center w-full mb-12">
                        {/* Vertical line connecting nodes (placed centrally) */}
                        {index !== Object.entries(stepsByPhase).length - 1 && (
                          <div className="absolute top-[4.5rem] h-12 w-1.5 bg-indigo-200 z-0"></div>
                        )}

                        <button
                          onClick={() => setActivePopupPhase(phase)}
                          className={`w-72 sm:w-80 py-5 px-6 rounded-2xl font-bold shadow-lg text-center transition-all hover:scale-105 border-4 z-10 ${isCompleted ? 'bg-green-50 border-green-400 text-green-800' : 'bg-white border-indigo-500 text-indigo-900 hover:bg-indigo-50'
                            }`}
                        >
                          <div className="text-[10px] uppercase font-black tracking-widest mb-1 opacity-60">Fase {index + 1}</div>
                          {phase}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Off-canvas Drawer overlay */}
      {activePopupPhase && (
        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm" onClick={() => setActivePopupPhase(null)}></div>
      )}

      {/* Drawer panel */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${activePopupPhase ? 'translate-x-0' : 'translate-x-full'}`}>
        {activePopupPhase && (
          <>
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center shadow-sm z-10">
              <div>
                <div className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider mb-1">Rincian Modul Fase</div>
                <h3 className="font-bold text-xl text-indigo-900 pr-4 leading-tight">{activePopupPhase}</h3>
              </div>
              <button onClick={() => setActivePopupPhase(null)} className="p-2 bg-white rounded-full text-indigo-300 hover:text-red-500 shadow-sm transition-colors cursor-pointer border border-indigo-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <p className="text-sm font-medium text-gray-500 mb-5 bg-white p-3 rounded-lg border border-gray-200 border-l-4 border-l-indigo-400 shadow-sm">
                Selesaikan seluruh rincian modul / tahapan praktik berikut untuk mengamankan <i>progress</i> fase ini.
              </p>
              <div className="space-y-4">
                {stepsByPhase[activePopupPhase].map(step => {
                  const progress = progressData.find(p => p.id_roadmap_step === step.id);
                  const isDone = progress?.status === 'completed';

                  return (
                    <div key={step.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all flex gap-4 ${isDone ? 'border-green-200 bg-green-50/50 opacity-80' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}`}>
                      <button
                        onClick={() => progress && toggleProgress(progress.id, progress.status)}
                        className="mt-1 shrink-0 transition-colors focus:outline-none"
                      >
                        {isDone ? (
                          <CheckCircle className="text-green-500 drop-shadow-sm" size={24} />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-indigo-400 cursor-pointer bg-white"></div>
                        )}
                      </button>
                      <div className="flex-1">
                        <h5 className={`font-bold text-[17px] mb-2 leading-snug ${isDone ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-800'}`}>
                          {step.title}
                        </h5>
                        <p className={`text-sm leading-relaxed ${isDone ? 'text-gray-400' : 'text-gray-600'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
