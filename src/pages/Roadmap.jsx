import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import careerService from '../services/careerService';
import { Map, CheckCircle, Clock, MapPin, Target, ChevronRight } from 'lucide-react';

export default function Roadmap() {
  const { impersonatedUser: user } = useUser();
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [steps, setSteps] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);

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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Map className="text-indigo-600" size={32} /> Career Roadmap
        </h1>
        <p className="text-gray-500 mt-2">Jalur pembelajaran yang dipersonalisasi AI untuk mencapai karir impian Anda.</p>
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
                <button
                  key={rm.id}
                  onClick={() => setActiveRoadmapId(rm.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                    activeRoadmapId === rm.id ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <MapPin size={18} className={activeRoadmapId === rm.id ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className={`font-medium text-sm line-clamp-2 ${activeRoadmapId === rm.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {rm.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Selected Roadmap */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
              
              {stepsLoading ? (
                 <div className="flex justify-center p-12"><Clock className="animate-spin text-indigo-400" size={32} /></div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(stepsByPhase).map(([phase, phaseSteps], index) => (
                    <div key={phase} className="relative">
                      {/* Timeline connecting line */}
                      {index !== Object.entries(stepsByPhase).length - 1 && (
                        <div className="absolute left-[1.15rem] top-10 bottom-[-2.5rem] w-0.5 bg-indigo-200"></div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md z-10 shrink-0">
                          {index + 1}
                        </div>
                        <h4 className="text-xl font-bold text-indigo-900">{phase}</h4>
                      </div>

                      <div className="pl-14 space-y-4">
                        {phaseSteps.map(step => {
                          const progress = progressData.find(p => p.id_roadmap_step === step.id);
                          const isCompleted = progress?.status === 'completed';

                          return (
                            <div key={step.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all flex gap-4 ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-indigo-300'}`}>
                               <button 
                                 onClick={() => progress && toggleProgress(progress.id, progress.status)}
                                 className="mt-1 shrink-0 transition-colors focus:outline-none"
                               >
                                 {isCompleted ? (
                                    <CheckCircle className="text-green-500" size={24} />
                                 ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-indigo-400"></div>
                                 )}
                               </button>
                               <div className="flex-1">
                                  <h5 className={`font-bold text-lg mb-1 ${isCompleted ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-800'}`}>
                                    {step.title}
                                  </h5>
                                  <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {step.description}
                                  </p>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
