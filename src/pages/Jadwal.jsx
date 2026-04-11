import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { AddJadwalModal, EditJadwalModal } from '../components/JadwalModals';
import { Plus, Edit, Trash2, BookOpen, RefreshCw } from 'lucide-react';


export default function Jadwal() {
    const { impersonatedUser } = useUser();
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Semester Handling could be added here if we want to filter by semester
    // For now, simple list as per original Home.jsx
    const [semesters, setSemesters] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentJadwal, setCurrentJadwal] = useState(null);
    const [filterDay, setFilterDay] = useState('All');

    const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    const fetchSemesters = useCallback(async () => {
        if (impersonatedUser) {
            try {
                const res = await dataService.getSemesters();
                setSemesters(res.data);
                // Default to latest or first?
                if (res.data.length > 0 && !selectedSemesterId) {
                    setSelectedSemesterId(res.data[0].id_semester);
                }
            } catch (e) { console.error("Failed to load semesters", e); }
        }
    }, [impersonatedUser, selectedSemesterId]);

    const fetchJadwal = useCallback(async () => {
        if (!impersonatedUser) {
            setJadwal([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // We can pass selectedSemesterId if we want to filter by semester
            // The API I wrote supports ?semester_id=...
            const response = await dataService.getJadwal(selectedSemesterId || null);
            setJadwal(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [impersonatedUser, selectedSemesterId]);

    useEffect(() => {
        fetchSemesters();
    }, [fetchSemesters]);

    useEffect(() => {
        fetchJadwal();
    }, [fetchJadwal]);

    const handleAddJadwal = async (data) => {
        await dataService.createJadwal({
            ...data,
            id_user: impersonatedUser.id_user,
            id_semester: selectedSemesterId || null // auto-attach to current view if selected
        });
        fetchJadwal();
    };

    const handleUpdateJadwal = async (data) => {
        await dataService.updateJadwal(data.id_jadwal, { ...data, id_user: impersonatedUser.id_user });
        fetchJadwal();
    };

    const handleDeleteJadwal = async (id) => {
        if (window.confirm('Delete this schedule?')) {
            await dataService.deleteJadwal(id);
            fetchJadwal();
        }
    };

    const openEditModal = (item) => {
        setCurrentJadwal(item);
        setIsEditModalOpen(true);
    };

    const filteredJadwal = jadwal.filter(item => filterDay === 'All' || item.hari === filterDay);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen /> Jadwal Kuliah</h2>
                    <p className="text-gray-500 text-sm">Manage your class schedules</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                </div>

                <div className="flex gap-2">
                    {/* Semester Filter */}
                    <select
                        value={selectedSemesterId}
                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                        className="border p-2 rounded-lg text-sm bg-white shadow-sm"
                    >
                        <option value="">All Semesters</option>
                        {semesters.map(s => (
                            <option key={s.id_semester} value={s.id_semester}>{s.tipe} {s.tahun_ajaran}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className={`px-4 py-2 text-white rounded-lg flex items-center gap-1 ${(!impersonatedUser || semesters.length === 0 || !selectedSemesterId) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={!impersonatedUser || semesters.length === 0 || !selectedSemesterId}
                        title={semesters.length === 0 ? "Create a semester first" : (!selectedSemesterId ? "Select a semester first" : "Add Schedule")}
                    >
                        <Plus size={18} /> Add Schedule
                    </button>
                </div>
            </div>

            {/* Semester Warning Message */}
            {impersonatedUser && semesters.length === 0 && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6" role="alert">
                    <p className="font-bold">No Semesters Found</p>
                    <p>You need to create a Semester first before you can add any Class Schedules (Jadwal Matkul). Go to the Semesters page to get started.</p>
                </div>
            )}
            
            {impersonatedUser && semesters.length > 0 && !selectedSemesterId && (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                    <p>Please select a semester from the dropdown above to view or add class schedules.</p>
                </div>
            )}

            {/* Day Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilterDay('All')}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterDay === 'All' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    All Days
                </button>
                {daysOfWeek.map(day => (
                    <button
                        key={day}
                        onClick={() => setFilterDay(day)}
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterDay === day ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {!impersonatedUser ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p>Please log in to manage schedules.</p>
                </div>
            ) : loading ? (
                <p>Loading schedules...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : filteredJadwal.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500">No schedules found for this filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJadwal.map((item) => (
                        <div key={item.id_jadwal} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{item.nama}</h3>
                                    <p className="text-blue-600 font-medium text-sm">{item.hari}, {item.jam_mulai.slice(0, 5)} - {item.jam_selesai.slice(0, 5)}</p>
                                </div>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{item.sks} SKS</span>
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="flex-1 py-1 text-gray-600 text-sm hover:bg-gray-50 rounded flex items-center justify-center gap-1"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteJadwal(item.id_jadwal)}
                                    className="flex-1 py-1 text-red-500 text-sm hover:bg-red-50 rounded flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddJadwalModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddJadwal={handleAddJadwal}
                impersonatedUser={impersonatedUser}
                daysOfWeek={daysOfWeek}
                semesterId={selectedSemesterId}
            />

            <EditJadwalModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdateJadwal={handleUpdateJadwal}
                jadwalItem={currentJadwal}
                daysOfWeek={daysOfWeek}
            />
        </div>
    );
}
