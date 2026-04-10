import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import AIQuickAdd from '../components/AIQuickAdd';
import { CheckCircle, Calendar, BookOpen, Flag, Plus } from 'lucide-react';
import { AddTodoModal } from '../components/TodoModals';
import { AddJadwalModal } from '../components/JadwalModals';

import TodosFull from './Todos';
import AkademikFull from './Akademik';

const PRIORITIES = ['Semua', 'Tinggi', 'Menengah', 'Rendah'];
const PRIORITY_STYLES = {
    'Tinggi': { badge: 'bg-rose-100 text-rose-700', border: 'border-l-rose-500', dot: 'bg-rose-500' },
    'Menengah': { badge: 'bg-yellow-100 text-yellow-800', border: 'border-l-yellow-400', dot: 'bg-yellow-400' },
    'Rendah': { badge: 'bg-slate-100 text-slate-700', border: 'border-l-slate-400', dot: 'bg-slate-400' },
};
const getPriorityStyle = (tipe) => PRIORITY_STYLES[tipe] ?? { badge: 'bg-slate-100 text-slate-600', border: 'border-l-slate-300', dot: 'bg-slate-400' };

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const TODAY_NAME = DAYS[new Date().getDay()];

function AgendaView({ impersonatedUser, loading, todaysAgenda, activeTodos, completedTodos, filteredTodos, filterPriority, setFilterPriority, toggleTodoCompletion, fetchData, isAddTodoOpen, setIsAddTodoOpen, setIsAddJadwalOpen }) {
    return (
        <div className="animate-fade-in mt-4 flex flex-col h-full min-h-0">
            {/* Smart Add Input */}
            <AIQuickAdd onAdded={fetchData} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 pb-4">
                {/* ── COLUMN 1: JADWAL & RUTINITAS HARI INI ── */}
                <div className="lg:col-span-5 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col h-full min-h-0 relative group">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 rounded-xl">
                                    <Calendar size={20} className="text-yellow-700" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Agenda Hari Ini</h2>
                                    <p className="text-xs text-slate-600 font-medium">Hari {TODAY_NAME}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="animate-pulse flex flex-col gap-3">
                                    {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
                                </div>
                            ) : todaysAgenda.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-600 text-sm mb-4">Tidak ada jadwal atau rutinitas hari ini.</p>
                                    <button onClick={() => setIsAddJadwalOpen(true)} className="px-4 py-2 bg-white text-yellow-700 border border-yellow-200 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors">
                                        + Tambah Jadwal
                                    </button>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pb-2">
                                    {todaysAgenda.map((item) => {
                                        const isJadwal = item.type === 'jadwal';
                                        return (
                                            <div key={`${item.type}-${isJadwal ? item.id_jadwal : item.id_rutinitas}`} className="relative pl-6">
                                                {/* Timeline dot */}
                                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${isJadwal ? 'bg-yellow-400' : 'bg-emerald-400'} shadow-sm`} />
                                                
                                                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-semibold text-slate-800">{item.nama}</h3>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isJadwal ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                            {isJadwal ? 'Kelas' : 'Habit'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 items-center text-xs text-slate-600 mb-2 font-medium">
                                                        {(item.jam_mulai || item.jam_selesai) && (
                                                            <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                                                                {item.jam_mulai?.slice(0,5) || '..'} - {item.jam_selesai?.slice(0,5) || '..'}
                                                            </span>
                                                        )}
                                                        {isJadwal && item.sks && <span>{item.sks} SKS</span>}
                                                    </div>
                                                    {item.deskripsi && <p className="text-xs text-slate-600 line-clamp-2">{item.deskripsi}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── COLUMN 2: PENDING TASKS (TODOLIST) ── */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col h-full min-h-0 relative group">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-xl">
                                    <CheckCircle size={20} className="text-emerald-700" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Task Aktif</h2>
                                    <p className="text-xs text-slate-600">{activeTodos.length} tugas pending</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddTodoOpen(true)} className="px-3 py-1.5 bg-emerald-200 text-emerald-950 font-bold rounded-lg text-sm hover:bg-emerald-300 flex items-center gap-1 transition-transform hover:scale-105">
                                <Plus size={16}/> Manual
                            </button>
                        </div>

                        {/* Priority Filter */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 shrink-0">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filterPriority === p ? 'bg-emerald-200 text-emerald-950 font-bold shadow-md shadow-slate-800/20' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                >
                                    {p !== 'Semua' && <Flag size={10} className="inline mr-1 mb-0.5" />}
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
                                </div>
                            ) : filteredTodos.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 my-auto h-full flex flex-col justify-center items-center">
                                    <CheckCircle size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-600 text-sm mb-4">Tidak ada task yang pending!</p>
                                    <button onClick={() => setIsAddTodoOpen(true)} className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
                                        + Buat Task Baru
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
                                    {filteredTodos.map((tugas) => {
                                        const style = getPriorityStyle(tugas.tipe);
                                        return (
                                            <div key={tugas.id_todo} className={`bg-white border rounded-xl p-4 transition-all shadow-sm hover:shadow border-l-4 hover:border-emerald-300 ${style.border}`}>
                                                <div className="flex items-start gap-3">
                                                    <button onClick={() => toggleTodoCompletion(tugas)} className={`mt-0.5 shrink-0 focus:outline-none transition-transform hover:scale-110`}>
                                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-green-400 bg-white"></div>
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm text-slate-800 truncate mb-1">{tugas.nama}</h3>
                                                        {tugas.deskripsi && <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">{tugas.deskripsi}</p>}
                                                        <div className="flex items-center gap-2 mt-auto">
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${style.badge}`}>
                                                                {tugas.tipe}
                                                            </span>
                                                            {tugas.tenggat && (
                                                                <span className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                                                                    <Calendar size={10} /> {new Date(tugas.tenggat).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {completedTodos.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Tugas Selesai ({completedTodos.length})</p>
                                    <div className="space-y-2 opacity-60">
                                        {completedTodos.slice(0, 3).map(t => (
                                            <div key={t.id_todo} className="flex items-center gap-3 text-sm">
                                                <CheckCircle size={16} className="text-green-500 shrink-0" />
                                                <span className="line-through text-slate-600 truncate">{t.nama}</span>
                                            </div>
                                        ))}
                                        {completedTodos.length > 3 && <p className="text-xs text-slate-600">Dan {completedTodos.length - 3} lainnya...</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function Planner() {
    const { impersonatedUser } = useUser();

    const [todos, setTodos] = useState([]);
    const [rutinitas, setRutinitas] = useState([]);
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('agenda');

    const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
    const [isAddJadwalOpen, setIsAddJadwalOpen] = useState(false);
    const [filterPriority, setFilterPriority] = useState('Semua');

    const fetchData = useCallback(async () => {
        if (!impersonatedUser) { setTodos([]); setRutinitas([]); setJadwal([]); setLoading(false); return; }
        setLoading(true);
        try {
            const [todosRes, rutRes, jadwalRes] = await Promise.all([
                dataService.getTodos(),
                dataService.getRutinitas(),
                dataService.getJadwal() 
            ]);
            setTodos(todosRes.data || []);
            setRutinitas(rutRes.data || []);
            setJadwal(jadwalRes.data || []);
        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setLoading(false);
        }
    }, [impersonatedUser]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const activeTodos = todos.filter(t => !t.is_completed);
    const completedTodos = todos.filter(t => t.is_completed);
    const filteredTodos = filterPriority === 'Semua' ? activeTodos : activeTodos.filter(t => t.tipe === filterPriority);

    const todayJadwal = jadwal.filter(j => j.hari === TODAY_NAME).sort((a,b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''));
    const todayRutinitas = rutinitas.filter(r => r.hari === TODAY_NAME || r.hari === 'Setiap Hari').sort((a,b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''));

    const todaysAgenda = [
        ...todayJadwal.map(j => ({ ...j, type: 'jadwal', sortTime: j.jam_mulai || '23:59' })),
        ...todayRutinitas.map(r => ({ ...r, type: 'rutinitas', sortTime: r.jam_mulai || '23:59' }))
    ].sort((a, b) => a.sortTime.localeCompare(b.sortTime));

    const toggleTodoCompletion = async (todo) => {
        try {
            await dataService.updateTodo(todo.id_todo, { ...todo, is_completed: !todo.is_completed });
            fetchData();
        } catch (e) { console.error('Gagal update status:', e); }
    };

    if (!impersonatedUser) {
        return <div className="p-6">Silakan login untuk mengakses Planner.</div>;
    }

    return (
        <div className="w-full flex-1 flex flex-col min-h-0">
            {/* Header with CTAs */}
            <div className="mb-6 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Unified Planner</h1>
                    <p className="text-slate-600 mt-1">Kelola jadwal kuliah, rutinitas harian, dan todolist dalam satu tempat.</p>
                </div>
                {/* Primary Global CTAs */}
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setIsAddJadwalOpen(true)} className="flex-1 md:flex-none px-4 py-2.5 bg-yellow-100 text-yellow-800 rounded-xl hover:bg-yellow-200 font-medium flex items-center justify-center gap-2 transition-transform hover:scale-105 text-sm ring-1 ring-yellow-200/60">
                        <Calendar size={16}/> Tambah Jadwal
                    </button>
                    <button onClick={() => setIsAddTodoOpen(true)} className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-300 text-emerald-950 font-bold shadow-lg shadow-emerald-400/30 rounded-xl hover:bg-emerald-400 font-medium flex items-center justify-center gap-2 transition-transform hover:scale-105 text-sm">
                        <CheckCircle size={16}/> Buat Todolist
                    </button>
                </div>
            </div>

            {/* TAB MENU UNTUK FULL LIST */}
            <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-xl mb-4 w-fit overflow-x-auto max-w-full shrink-0 items-center">
                {[
                    { id: 'agenda', label: 'Overview Hari Ini', icon: Calendar },
                    { id: 'todos', label: 'Semua Task & Habit', icon: CheckCircle },
                    { id: 'akademik', label: 'Akademik & Semester', icon: BookOpen }
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Switcher */}
            <div className="flex-1 min-h-0">
                {activeTab === 'agenda' && (
                    <AgendaView 
                        impersonatedUser={impersonatedUser}
                        loading={loading}
                        todaysAgenda={todaysAgenda}
                        activeTodos={activeTodos}
                        completedTodos={completedTodos}
                        filteredTodos={filteredTodos}
                        filterPriority={filterPriority}
                        setFilterPriority={setFilterPriority}
                        toggleTodoCompletion={toggleTodoCompletion}
                        fetchData={fetchData}
                        isAddTodoOpen={isAddTodoOpen}
                        setIsAddTodoOpen={setIsAddTodoOpen}
                        setIsAddJadwalOpen={setIsAddJadwalOpen}
                    />
                )}
                {activeTab === 'todos' && (
                    <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <TodosFull />
                        </div>
                    </div>
                )}
                {activeTab === 'akademik' && (
                    <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <AkademikFull />
                        </div>
                    </div>
                )}
            </div>

            <AddTodoModal isOpen={isAddTodoOpen} onClose={() => setIsAddTodoOpen(false)} onAddTodo={async (data) => {
                await dataService.createTodo({ ...data, id_user: impersonatedUser.id_user });
                fetchData();
            }} impersonatedUser={impersonatedUser} />
            
            <AddJadwalModal 
                 isOpen={isAddJadwalOpen} 
                 onClose={() => setIsAddJadwalOpen(false)} 
                 onAddJadwal={async (data) => {
                     await dataService.createJadwal({ ...data });
                     fetchData();
                 }} 
                 semesters={[]} 
            />
        </div>
    );
}
