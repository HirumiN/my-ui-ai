import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { AddSemesterModal, EditSemesterModal } from '../components/SemesterModal';
import { AddJadwalModal, EditJadwalModal } from '../components/JadwalModals';
import CurriculumModal from '../components/CurriculumModal';
import { Plus, Edit, Trash2, BookOpen, Calendar, Users, RefreshCw, Link as LinkIcon } from 'lucide-react';

const TABS = [
    { key: 'jadwal', label: 'Jadwal Kuliah', icon: BookOpen },
    { key: 'ukm', label: 'UKM', icon: Users },
];

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// ─────────────── SEMESTER SECTION ───────────────
// Semester section removed

// ─────────────── JADWAL SECTION ───────────────
function JadwalSection({ impersonatedUser }) {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDay, setFilterDay] = useState('All');
    const [selectedSemesterLevel, setSelectedSemesterLevel] = useState(1);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const fetchJadwal = useCallback(async () => {
        if (!impersonatedUser) { setJadwal([]); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await dataService.getJadwal();
            setJadwal(res.data);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [impersonatedUser]);

    useEffect(() => { fetchJadwal(); }, [fetchJadwal]);

    const handleAdd = async (data) => {
        await dataService.createJadwal({ ...data, id_user: impersonatedUser.id_user, semester_level: selectedSemesterLevel });
        fetchJadwal();
    };
    const handleUpdate = async (data) => {
        await dataService.updateJadwal(data.id_jadwal, { ...data, id_user: impersonatedUser.id_user });
        fetchJadwal();
    };
    const handleDelete = async (id) => {
        if (window.confirm('Hapus jadwal ini?')) { await dataService.deleteJadwal(id); fetchJadwal(); }
    };

    const filtered = jadwal.filter(item => {
        const dayMatch = filterDay === 'All' || item.hari === filterDay;
        const semMatch = item.semester_level === parseInt(selectedSemesterLevel);
        return dayMatch && semMatch;
    });

    if (!impersonatedUser) return <LoginPrompt />;

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium text-gray-700">Filter Semester:</label>
                    <select 
                        value={selectedSemesterLevel} 
                        onChange={e => setSelectedSemesterLevel(e.target.value)}
                        className="border border-gray-300 rounded-lg p-1.5 text-sm bg-white shadow-sm font-semibold text-emerald-800"
                    >
                        {[1,2,3,4,5,6,7,8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-sm shadow-sm transition-all hover:scale-105">
                        <Plus size={16} /> Tambah Jadwal
                    </button>
                </div>
            </div>


            {/* Day Filter Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                <button onClick={() => setFilterDay('All')}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterDay === 'All' ? 'bg-emerald-600 text-white font-bold shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Semua Hari
                </button>
                {daysOfWeek.map(day => (
                    <button key={day} onClick={() => setFilterDay(day)}
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterDay === day ? 'bg-emerald-600 text-white font-bold shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {day}
                    </button>
                ))}
            </div>

            {loading ? <p className="text-gray-500">Memuat jadwal...</p>
                : error ? <p className="text-red-500">{error}</p>
                    : filtered.length === 0 ? <EmptyState message="Tidak ada jadwal untuk filter ini." />
                        : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map(item => (
                                    <div key={item.id_jadwal} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-400">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-base">{item.nama}</h3>
                                                <p className="text-emerald-700 font-medium text-sm">{item.hari}, {item.jam_mulai?.slice(0, 5)} – {item.jam_selesai?.slice(0, 5)}</p>
                                            </div>
                                            <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">{item.sks} SKS</span>
                                        </div>
                                        <div className="flex gap-2 mt-3 pt-3 border-t">
                                            <button onClick={() => { setCurrent(item); setIsEditOpen(true); }}
                                                className="flex-1 py-1 text-gray-600 text-sm hover:bg-gray-50 rounded flex items-center justify-center gap-1">
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(item.id_jadwal)}
                                                className="flex-1 py-1 text-red-500 text-sm hover:bg-red-50 rounded flex items-center justify-center gap-1">
                                                <Trash2 size={14} /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
            }

            <AddJadwalModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddJadwal={handleAdd}
                impersonatedUser={impersonatedUser} daysOfWeek={daysOfWeek} />
            <EditJadwalModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdateJadwal={handleUpdate}
                jadwalItem={current} daysOfWeek={daysOfWeek} />
        </div>
    );
}

// ─────────────── UKM SECTION ───────────────
function UKMSection({ impersonatedUser }) {
    const [ukmList, setUkmList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUkm, setNewUkm] = useState({ nama: '', jabatan: '', deskripsi: '' });
    const [addingUkm, setAddingUkm] = useState(false);
    const [addError, setAddError] = useState(null);

    const fetch_ = useCallback(async () => {
        if (!impersonatedUser) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/ukm?id_user=${impersonatedUser.id_user}`);
            setUkmList(await res.json());
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [impersonatedUser]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!impersonatedUser) return;
        setAddingUkm(true); setAddError(null);
        try {
            const fd = new URLSearchParams({ ...newUkm, id_user: impersonatedUser.id_user });
            const res = await fetch('http://localhost:8000/add-ukm', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setNewUkm({ nama: '', jabatan: '', deskripsi: '' });
            fetch_();
        } catch (e) { setAddError(e.message); }
        finally { setAddingUkm(false); }
    };

    const handleDelete = async (id) => {
        await fetch(`http://localhost:8000/delete-ukm/${id}`, { method: 'POST' });
        fetch_();
    };

    if (!impersonatedUser) return <LoginPrompt />;
    if (loading) return <p className="text-gray-500">Memuat UKM...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2">
                <p className="text-gray-500 text-sm mb-4">Daftar organisasi dan kegiatan mahasiswa</p>
                {ukmList.length === 0 ? <EmptyState message="Belum ada UKM." /> : (
                    <div className="space-y-3">
                        {ukmList.map(ukm => (
                            <div key={ukm.id_ukm} className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{ukm.nama} <span className="text-gray-500 font-normal text-sm">– {ukm.jabatan}</span></p>
                                    {ukm.deskripsi && <p className="text-sm text-gray-500 mt-1">{ukm.deskripsi}</p>}
                                </div>
                                <button onClick={() => handleDelete(ukm.id_ukm)} className="ml-4 p-1 hover:bg-red-50 rounded text-red-500 flex-shrink-0"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Form */}
            <div className="bg-white border rounded-xl p-5 shadow-sm h-fit">
                <h3 className="font-semibold mb-4">Tambah UKM</h3>
                <form onSubmit={handleAdd} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama UKM</label>
                        <input type="text" required value={newUkm.nama} onChange={e => setNewUkm(p => ({ ...p, nama: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                        <input type="text" required value={newUkm.jabatan} onChange={e => setNewUkm(p => ({ ...p, jabatan: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea rows={3} value={newUkm.deskripsi} onChange={e => setNewUkm(p => ({ ...p, deskripsi: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm" />
                    </div>
                    {addError && <p className="text-red-500 text-sm">{addError}</p>}
                    <button type="submit" disabled={addingUkm}
                        className="w-full py-2 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 text-sm font-medium shadow-sm transition-all">
                        {addingUkm ? 'Menyimpan...' : 'Tambah UKM'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─────────────── SHARED HELPERS ───────────────
function LoginPrompt() {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg" role="alert">
            <p>Silakan login untuk mengelola data akademik.</p>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

// ─────────────── MAIN PAGE ───────────────
export default function Akademik() {
    const { impersonatedUser } = useUser();
    const [activeTab, setActiveTab] = useState('jadwal');

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Akademik</h2>
                <p className="text-gray-500 text-sm">Kelola semester, jadwal kuliah, dan kegiatan mahasiswa (UKM)</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'jadwal' && <JadwalSection impersonatedUser={impersonatedUser} />}
            {activeTab === 'ukm' && <UKMSection impersonatedUser={impersonatedUser} />}
        </div>
    );
}
