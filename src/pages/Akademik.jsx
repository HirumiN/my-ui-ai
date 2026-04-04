import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { AddSemesterModal, EditSemesterModal } from '../components/SemesterModal';
import { AddJadwalModal, EditJadwalModal } from '../components/JadwalModals';
import { Plus, Edit, Trash2, BookOpen, Calendar, Users, RefreshCw } from 'lucide-react';

const TABS = [
    { key: 'jadwal', label: 'Jadwal Kuliah', icon: BookOpen },
    { key: 'semester', label: 'Semester', icon: Calendar },

    { key: 'ukm', label: 'UKM', icon: Users },
];

const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// ─────────────── SEMESTER SECTION ───────────────
function SemesterSection({ impersonatedUser }) {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const fetch_ = useCallback(async () => {
        if (!impersonatedUser) { setSemesters([]); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await dataService.getSemesters();
            setSemesters(res.data);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [impersonatedUser]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleAdd = async (data) => {
        await dataService.createSemester({ ...data, id_user: impersonatedUser.id_user });
        fetch_();
    };
    const handleUpdate = async (data) => {
        await dataService.updateSemester(data.id_semester, { ...data, id_user: impersonatedUser.id_user });
        fetch_();
    };
    const handleDelete = async (id) => {
        if (window.confirm('Hapus semester ini beserta semua jadwal dan kalender Google-nya?')) {
            await dataService.deleteSemester(id);
            fetch_();
        }
    };

    if (!impersonatedUser) return <LoginPrompt />;
    if (loading) return <p className="text-gray-500">Memuat semester...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500 text-sm">Kelola semester akademik (sinkron dengan Google Kalender)</p>
                <button onClick={() => setIsAddOpen(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm">
                    <Plus size={16} /> Tambah Semester
                </button>
            </div>

            {semesters.length === 0 ? (
                <EmptyState message="Belum ada semester. Buat semester terlebih dahulu!" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semesters.map(sem => (
                        <div key={sem.id_semester} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => { setCurrent(sem); setIsEditOpen(true); }} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(sem.id_semester)} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={16} /></button>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{sem.tipe} {sem.tahun_ajaran}</h3>
                            <div className="text-sm text-gray-500 mb-3">
                                <p>Mulai: {sem.tanggal_mulai}</p>
                                <p>Selesai: {sem.tanggal_selesai}</p>
                            </div>
                            {sem.google_calendar_id && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Google Calendar Synced
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <AddSemesterModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddSemester={handleAdd} impersonatedUser={impersonatedUser} />
            <EditSemesterModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdateSemester={handleUpdate} semester={current} />
        </div>
    );
}

// ─────────────── JADWAL SECTION ───────────────
function JadwalSection({ impersonatedUser }) {
    const [jadwal, setJadwal] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [filterDay, setFilterDay] = useState('All');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const fetchSemesters = useCallback(async () => {
        if (!impersonatedUser) return;
        try {
            const res = await dataService.getSemesters();
            setSemesters(res.data);
            if (res.data.length > 0 && !selectedSemesterId) {
                setSelectedSemesterId(res.data[0].id_semester);
            }
        } catch (e) { console.error(e); }
    }, [impersonatedUser, selectedSemesterId]);

    const fetchJadwal = useCallback(async () => {
        if (!impersonatedUser) { setJadwal([]); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await dataService.getJadwal(selectedSemesterId || null);
            setJadwal(res.data);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }, [impersonatedUser, selectedSemesterId]);

    useEffect(() => { fetchSemesters(); }, [fetchSemesters]);
    useEffect(() => { fetchJadwal(); }, [fetchJadwal]);

    const handleAdd = async (data) => {
        await dataService.createJadwal({ ...data, id_user: impersonatedUser.id_user, id_semester: selectedSemesterId || null });
        fetchJadwal();
    };
    const handleUpdate = async (data) => {
        await dataService.updateJadwal(data.id_jadwal, { ...data, id_user: impersonatedUser.id_user });
        fetchJadwal();
    };
    const handleDelete = async (id) => {
        if (window.confirm('Hapus jadwal ini?')) { await dataService.deleteJadwal(id); fetchJadwal(); }
    };

    const filtered = jadwal.filter(item => filterDay === 'All' || item.hari === filterDay);

    if (!impersonatedUser) return <LoginPrompt />;

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div className="flex gap-2">
                    <button onClick={async () => {
                        if (window.confirm("Resync semua kalender?")) {
                            try { await dataService.manualSync(); alert("Sync berhasil!"); }
                            catch (e) { alert("Sync gagal: " + e.message); }
                        }
                    }} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 border text-sm">
                        <RefreshCw size={14} /> Resync
                    </button>
                </div>
                <div className="flex gap-2 items-center">
                    <select value={selectedSemesterId} onChange={e => setSelectedSemesterId(e.target.value)}
                        className="border p-2 rounded-lg text-sm bg-white shadow-sm">
                        <option value="">Semua Semester</option>
                        {semesters.map(s => (
                            <option key={s.id_semester} value={s.id_semester}>{s.tipe} {s.tahun_ajaran}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        disabled={semesters.length === 0 || !selectedSemesterId}
                        title={semesters.length === 0 ? "Buat semester dulu" : (!selectedSemesterId ? "Pilih semester" : "Tambah Jadwal")}
                        className={`px-4 py-2 text-white rounded-lg flex items-center gap-1 text-sm ${(semesters.length === 0 || !selectedSemesterId) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        <Plus size={16} /> Tambah Jadwal
                    </button>
                </div>
            </div>

            {/* Semester Warning */}
            {semesters.length === 0 && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Belum ada Semester</p>
                    <p className="text-sm">Buat semester di tab <strong>Semester</strong> terlebih dahulu sebelum menambah jadwal kuliah.</p>
                </div>
            )}
            {semesters.length > 0 && !selectedSemesterId && (
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-3 mb-4 rounded-r-lg text-sm">
                    Pilih semester dari dropdown untuk melihat atau menambah jadwal.
                </div>
            )}

            {/* Day Filter Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                <button onClick={() => setFilterDay('All')}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterDay === 'All' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Semua Hari
                </button>
                {daysOfWeek.map(day => (
                    <button key={day} onClick={() => setFilterDay(day)}
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filterDay === day ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
                                    <div key={item.id_jadwal} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-base">{item.nama}</h3>
                                                <p className="text-blue-600 font-medium text-sm">{item.hari}, {item.jam_mulai?.slice(0, 5)} – {item.jam_selesai?.slice(0, 5)}</p>
                                            </div>
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{item.sks} SKS</span>
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
                impersonatedUser={impersonatedUser} daysOfWeek={daysOfWeek} semesterId={selectedSemesterId} />
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
                        className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium">
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
    const [activeTab, setActiveTab] = useState('semester');

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
            {activeTab === 'semester' && <SemesterSection impersonatedUser={impersonatedUser} />}
            {activeTab === 'jadwal' && <JadwalSection impersonatedUser={impersonatedUser} />}
            {activeTab === 'ukm' && <UKMSection impersonatedUser={impersonatedUser} />}
        </div>
    );
}
