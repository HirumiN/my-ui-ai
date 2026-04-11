import React, { useState, useEffect } from 'react';
import { X, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import dataService from '../services/dataService';

export default function CurriculumModal({ isOpen, onClose, semesterId, onConnected }) {
    const [step, setStep] = useState(1);
    const [campuses, setCampuses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [curricula, setCurricula] = useState([]);
    
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCurr, setSelectedCurr] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchCampuses();
            setStep(1);
            setSelectedCampus(null);
            setSelectedDept(null);
            setSelectedCurr(null);
        }
    }, [isOpen]);

    const fetchCampuses = async () => {
        try {
            const res = await dataService.getCampuses();
            setCampuses(res.data);
        } catch (e) { setError("Gagal memuat daftar kampus"); }
    };

    const handleCampusSelect = async (campus) => {
        setSelectedCampus(campus);
        setLoading(true);
        try {
            const res = await dataService.getDepartments(campus.id);
            setDepartments(res.data);
            setStep(2);
        } catch (e) { setError("Gagal memuat jurusan"); }
        finally { setLoading(false); }
    };

    const handleDeptSelect = async (dept) => {
        setSelectedDept(dept);
        setLoading(true);
        try {
            const res = await dataService.getCurricula(dept.id);
            if (res.data && res.data.length > 0) {
                setSelectedCurr(res.data[0]); // Auto select the first (only) curriculum
                setStep(3); // Now step 3 is confirmation
            } else {
                setError("Tidak ada data kurikulum untuk jurusan ini");
            }
        } catch (e) { setError("Gagal memuat kurikulum"); }
        finally { setLoading(false); }
    };


    const handleConnect = async () => {
        setLoading(true);
        try {
            await dataService.connectCurriculum({
                curriculum_id: selectedCurr.id,
                id_semester: semesterId,
            });
            onConnected();
            onClose();
        } catch (e) { setError("Gagal menyambungkan kurikulum"); }
        finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-emerald-50">
                    <div className="flex items-center gap-2">
                        <BookOpen className="text-emerald-600" size={20} />
                        <h3 className="font-bold text-emerald-900">Sambungkan Kurikulum</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-emerald-100 rounded-full text-emerald-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}

                    {/* Step Indicator */}
                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    {loading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    )}

                    {!loading && (
                        <>
                            {step === 1 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500 mb-3">Pilih Kampus Anda:</p>
                                    {campuses.map(c => (
                                        <button key={c.id} onClick={() => handleCampusSelect(c)}
                                            className="w-full p-4 border rounded-xl hover:border-emerald-500 hover:bg-emerald-50 text-left flex justify-between items-center group transition-all">
                                            <span className="font-semibold">{c.name}</span>
                                            <ChevronRight className="text-gray-400 group-hover:text-emerald-500" size={18} />
                                        </button>
                                    ))}
                                    {campuses.length === 0 && <p className="text-center text-gray-400 py-4 italic">Belum ada data kampus. Silakan impor data kurikulum terlebih dahulu.</p>}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-2">
                                    <button onClick={() => setStep(1)} className="text-xs text-emerald-600 font-bold mb-2">&larr; Kembali ke Kampus</button>
                                    <p className="font-bold mb-1">{selectedCampus.name}</p>
                                    <p className="text-sm text-gray-500 mb-3">Pilih Jurusan:</p>
                                    {departments.map(d => (
                                        <button key={d.id} onClick={() => handleDeptSelect(d)}
                                            className="w-full p-4 border rounded-xl hover:border-emerald-500 hover:bg-emerald-50 text-left flex justify-between items-center group transition-all">
                                            <span className="font-semibold">{d.name}</span>
                                            <ChevronRight className="text-gray-400 group-hover:text-emerald-500" size={18} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <button onClick={() => setStep(2)} className="text-xs text-emerald-600 font-bold mb-2">&larr; Kembali ke Jurusan</button>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Konfirmasi</p>
                                        <p className="font-bold text-emerald-900">{selectedCampus.name}</p>
                                        <p className="text-emerald-800">{selectedDept.name}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">Mata kuliah dari jurusan ini akan ditambahkan ke jadwal Anda.</p>
                                    
                                    <button onClick={handleConnect}
                                        className="w-full py-4 bg-emerald-500 text-emerald-950 font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5 mt-4">
                                        Sambungkan Sekarang
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
