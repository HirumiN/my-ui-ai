import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import AIQuickAdd from '../components/AIQuickAdd';
import { CheckCircle, Calendar, BookOpen, Flag, Plus } from 'lucide-react';
import { AddTodoModal } from '../components/TodoModals';
import { AddJadwalModal } from '../components/JadwalModals';
import { AddRutinitasModal } from '../components/RutinitasModals';

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


export default function Planner() {
    const { impersonatedUser } = useUser();

    const [todos, setTodos] = useState([]);
    const [rutinitas, setRutinitas] = useState([]);
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todos');

    const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
    const [isAddJadwalOpen, setIsAddJadwalOpen] = useState(false);
    const [isAddRutModalOpen, setIsAddRutModalOpen] = useState(false);
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

    const userSemester = impersonatedUser?.semester_sekarang ? parseInt(impersonatedUser.semester_sekarang) : null;
    const todayJadwal = jadwal.filter(j => 
        j.hari === TODAY_NAME && 
        (!userSemester || !j.semester_level || j.semester_level === userSemester)
    ).sort((a,b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''));
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
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={() => setIsAddRutModalOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-50 font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 text-xs shadow-sm">
                        <Plus size={14}/> Habit
                    </button>
                    <button onClick={() => setIsAddJadwalOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-white text-yellow-700 border border-yellow-200 rounded-xl hover:bg-yellow-50 font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 text-xs shadow-sm">
                        <Calendar size={14}/> Jadwal
                    </button>
                    <button onClick={() => setIsAddTodoOpen(true)} className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-transform hover:scale-105 text-sm">
                        <Plus size={18}/> BUAT TASK
                    </button>
                </div>
            </div>

            {/* TAB MENU UNTUK FULL LIST */}
            <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-xl mb-4 w-fit overflow-x-auto max-w-full shrink-0 items-center">
                {[
                    { id: 'todos', label: 'Semua Task & Habit', icon: CheckCircle },
                    { id: 'akademik', label: 'Akademik & Jadwal', icon: BookOpen }
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
                 daysOfWeek={DAYS}
            />

             <AddRutinitasModal 
                 isOpen={isAddRutModalOpen} 
                 onClose={() => setIsAddRutModalOpen(false)} 
                 onAddRutinitas={async (data) => {
                     await dataService.createRutinitas({ ...data, id_user: impersonatedUser.id_user });
                     fetchData();
                 }} 
                 impersonatedUser={impersonatedUser}
             />
        </div>
    );
}
