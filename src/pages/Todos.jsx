import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { AddTodoModal, EditTodoModal } from '../components/TodoModals';
import { AddRutinitasModal, EditRutinitasModal } from '../components/RutinitasModals';
import { Plus, Edit, Trash2, ListTodo, Calendar, Flag, Repeat, CheckSquare, CheckCircle } from 'lucide-react';

const PRIORITIES = ['Semua', 'Tinggi', 'Menengah', 'Rendah'];

const PRIORITY_STYLES = {
    'Tinggi':   { badge: 'bg-red-100 text-red-700',    border: 'border-l-red-500',    dot: 'bg-red-500'    },
    'Menengah': { badge: 'bg-yellow-100 text-yellow-700', border: 'border-l-yellow-400', dot: 'bg-yellow-400' },
    'Rendah':   { badge: 'bg-green-100 text-green-700', border: 'border-l-green-500',  dot: 'bg-green-500'  },
};

const getPriorityStyle = (tipe) => PRIORITY_STYLES[tipe] ?? { badge: 'bg-gray-100 text-gray-600', border: 'border-l-gray-300', dot: 'bg-gray-400' };

export default function Todos() {
    const { impersonatedUser } = useUser();
    
    // Tabs state
    const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'rutinitas'

    // Todos state
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterPriority, setFilterPriority] = useState('Semua');
    const [selectedTodos, setSelectedTodos] = useState([]);

    // Rutinitas state
    const [rutinitas, setRutinitas] = useState([]);
    const [loadingRutinitas, setLoadingRutinitas] = useState(false);
    const [selectedRutinitas, setSelectedRutinitas] = useState([]);
    
    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);
    
    const [isAddRutModalOpen, setIsAddRutModalOpen] = useState(false);
    const [isEditRutModalOpen, setIsEditRutModalOpen] = useState(false);
    const [currentRut, setCurrentRut] = useState(null);

    const fetchData = useCallback(async () => {
        if (!impersonatedUser) { setTodos([]); setRutinitas([]); setLoading(false); return; }
        
        if (activeTab === 'todos') {
            setLoading(true);
            try {
                const response = await dataService.getTodos();
                setTodos(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoadingRutinitas(true);
            try {
                const response = await dataService.getRutinitas();
                setRutinitas(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingRutinitas(false);
            }
        }
        // clear selections when reloading data to avoid zombie states
        setSelectedTodos([]);
        setSelectedRutinitas([]);
    }, [impersonatedUser, activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Handlers Todos
    const handleAddTodo    = async (data) => { await dataService.createTodo({ ...data, id_user: impersonatedUser.id_user }); fetchData(); };
    const handleUpdateTodo = async (data) => { await dataService.updateTodo(data.id_todo, { ...data, id_user: impersonatedUser.id_user }); fetchData(); };
    const handleDeleteTodo = async (id)   => { if (window.confirm('Hapus task ini?')) { await dataService.deleteTodo(id); fetchData(); } };
    const openEditTodoModal    = (todo)   => { setCurrentTodo(todo); setIsEditModalOpen(true); };
    const toggleTodoCompletion = async (todo) => {
        try {
            await dataService.updateTodo(todo.id_todo, { ...todo, is_completed: !todo.is_completed });
            fetchData();
        } catch (e) {
            console.error('Gagal update status:', e);
        }
    };
    
    const toggleSelectTodo = (id) => {
        setSelectedTodos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const handleBulkDeleteTodos = async (ids) => {
        if (!window.confirm(`Yakin ingin menghapus ${ids.length} task ini secara permanen?`)) return;
        setLoading(true);
        try {
           await Promise.all(ids.map(id => dataService.deleteTodo(id)));
           fetchData();
        } catch(e) { console.error(e); alert('Terjadi kesalahan saat menghapus.'); setLoading(false); }
    };

    // Handlers Rutinitas
    const handleAddRutinitas    = async (data) => { await dataService.createRutinitas({ ...data, id_user: impersonatedUser.id_user }); fetchData(); };
    const handleUpdateRutinitas = async (data) => { await dataService.updateRutinitas(data.id_rutinitas, { ...data, id_user: impersonatedUser.id_user }); fetchData(); };
    const handleDeleteRutinitas = async (id)   => { if (window.confirm('Hapus rutinitas ini?')) { await dataService.deleteRutinitas(id); fetchData(); } };
    const openEditRutModal      = (rut)        => { setCurrentRut(rut); setIsEditRutModalOpen(true); };
    
    const toggleSelectRutinitas = (id) => {
        setSelectedRutinitas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const handleBulkDeleteRutinitas = async (ids) => {
        if (!window.confirm(`Yakin ingin menghapus ${ids.length} rutinitas ini secara permanen?`)) return;
        setLoadingRutinitas(true);
        try {
           await Promise.all(ids.map(id => dataService.deleteRutinitas(id)));
           fetchData();
        } catch(e) { console.error(e); alert('Terjadi kesalahan saat menghapus.'); setLoading(false); }
    };


    const filteredTodos = filterPriority === 'Semua' ? todos : todos.filter(t => t.tipe === filterPriority);
    const counts = todos.reduce((acc, t) => { acc[t.tipe] = (acc[t.tipe] || 0) + 1; return acc; }, {});

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><ListTodo /> Task & Habits</h2>
                    <p className="text-gray-500 text-sm">Kelola tugas dan rutinitas harianmu</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Bulk Delete Actions Disabled temporarily by Request */}

                    <button
                        onClick={() => activeTab === 'todos' ? setIsAddModalOpen(true) : setIsAddRutModalOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1 transition-all shadow-md"
                        disabled={!impersonatedUser}
                    >
                        <Plus size={18} /> {activeTab === 'todos' ? 'Tambah Task' : 'Tambah Habit'}
                    </button>
                </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex gap-4 border-b mb-6 mt-4">
                <button 
                    className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'todos' ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('todos')}
                >
                    <div className="flex items-center gap-2"><CheckSquare size={16} /> Todo List</div>
                </button>
                <button 
                    className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'rutinitas' ? 'border-b-2 border-emerald-500 text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('rutinitas')}
                >
                    <div className="flex items-center gap-2"><Repeat size={16} /> Rutinitas / Habits</div>
                </button>
            </div>

            {/* Content for Todos */}
            {activeTab === 'todos' && (
                <div>
                    {/* Priority summary chips */}
                    {impersonatedUser && todos.length > 0 && (
                        <div className="flex gap-3 mb-5">
                            {['Tinggi', 'Menengah', 'Rendah'].map(p => {
                                const s = getPriorityStyle(p);
                                return counts[p] ? (
                                    <span key={p} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                        {p}: {counts[p]}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}

                    {/* Priority Filter Pills */}
                    {impersonatedUser && (
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterPriority === p ? 'bg-emerald-600 text-white font-bold shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {p !== 'Semua' && <Flag size={12} />}
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    {!impersonatedUser ? (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg" role="alert">
                            <p>Silakan login untuk mengelola todolist.</p>
                        </div>
                    ) : loading ? (
                        <p className="text-gray-500">Memuat tugas...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : filteredTodos.length === 0 ? (
                        <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed">
                            <ListTodo className="mx-auto mb-2 text-gray-300" size={40} />
                            <p className="text-gray-500">{filterPriority === 'Semua' ? 'Belum ada task.' : `Tidak ada task prioritas "${filterPriority}".`}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTodos.map((tugas) => {
                                const style = getPriorityStyle(tugas.tipe);
                                const isDone = tugas.is_completed;
                                return (
                                    <div key={tugas.id_todo} className={`bg-white border rounded-xl p-5 transition-all border-l-4 ${style.border} ${isDone ? 'opacity-50 bg-gray-50' : 'shadow-sm hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-3 gap-4">
                                            <div className="flex items-start gap-4 flex-1 cursor-pointer group" onClick={() => toggleTodoCompletion(tugas)}>
                                                <button className={`mt-0.5 shrink-0 focus:outline-none transition-transform group-hover:scale-110`} title={isDone ? "Batalkan selesai" : "Tandai selesai"}>
                                                    {isDone ? (
                                                        <CheckCircle className="text-green-500 drop-shadow-sm" size={24} />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green-400 bg-white"></div>
                                                    )}
                                                </button>
                                                <h3 className={`font-semibold text-lg leading-snug pt-0.5 transition-colors ${isDone ? 'line-through text-gray-400' : 'text-gray-800 group-hover:text-black'}`}>{tugas.nama}</h3>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap hidden sm:block ${style.badge}`}>
                                                    {tugas.tipe || '—'}
                                                </span>
                                            </div>
                                        </div>
                                        {tugas.deskripsi && (
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{tugas.deskripsi}</p>
                                        )}
                                        {tugas.tenggat && (
                                            <div className="text-xs text-red-500 font-medium mb-3 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(tugas.tenggat).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-3 border-t mt-auto">
                                            <button onClick={() => openEditTodoModal(tugas)}
                                                className="flex-1 py-1.5 border rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-gray-50">
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button onClick={() => handleDeleteTodo(tugas.id_todo)}
                                                className="flex-1 py-1.5 border border-red-100 text-red-600 rounded-lg text-sm bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1">
                                                <Trash2 size={14} /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Content for Rutinitas */}
            {activeTab === 'rutinitas' && (
                <div>
                     {!impersonatedUser ? (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg" role="alert">
                            <p>Silakan login untuk mengelola rutinitas.</p>
                        </div>
                    ) : loadingRutinitas ? (
                        <p className="text-gray-500">Memuat rutinitas...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : rutinitas.length === 0 ? (
                        <div className="text-center p-10 bg-emerald-50 rounded-lg border border-dashed border-emerald-200">
                            <Repeat className="mx-auto mb-2 text-emerald-300" size={40} />
                            <p className="text-emerald-400 font-medium">Belum ada daftar rutinitas / habit.</p>
                            <p className="text-emerald-400 text-sm mt-1">Tambahkan agar RAG Gemini lebih memahami kesibukanmu.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rutinitas.map((rut) => (
                                <div key={rut.id_rutinitas} className={`bg-white border border-emerald-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col`}>
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <h3 className="font-semibold text-emerald-900 text-lg leading-snug pr-2">{rut.nama}</h3>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md whitespace-nowrap bg-emerald-100 text-emerald-800 hidden sm:block`}>
                                                <Repeat size={12} className="inline mr-1 mb-0.5"/>Habit
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-emerald-700 font-medium">
                                        <Calendar size={14} /> {rut.hari}
                                    </div>
                                    {(rut.jam_mulai || rut.jam_selesai) && (
                                        <div className="text-xs text-gray-500 font-medium mb-3">
                                            ⏰ {rut.jam_mulai?.slice(0,5) || '..'} - {rut.jam_selesai?.slice(0,5) || '..'}
                                        </div>
                                    )}
                                    {rut.deskripsi && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 bg-white/50 p-2 rounded">{rut.deskripsi}</p>
                                    )}
                                    <div className="flex gap-2 pt-3 border-t border-emerald-100 mt-auto">
                                        <button onClick={() => openEditRutModal(rut)}
                                            className="flex-1 py-1.5 border border-emerald-200 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-white text-emerald-800 bg-emerald-50/50">
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleDeleteRutinitas(rut.id_rutinitas)}
                                            className="flex-1 py-1.5 border border-red-100 text-red-600 rounded-lg text-sm bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1">
                                            <Trash2 size={14} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <AddTodoModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddTodo={handleAddTodo} impersonatedUser={impersonatedUser} />
            <EditTodoModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdateTodo={handleUpdateTodo} todo={currentTodo} />

            <AddRutinitasModal isOpen={isAddRutModalOpen} onClose={() => setIsAddRutModalOpen(false)} onAddRutinitas={handleAddRutinitas} impersonatedUser={impersonatedUser} />
            <EditRutinitasModal isOpen={isEditRutModalOpen} onClose={() => setIsEditRutModalOpen(false)} onUpdateRutinitas={handleUpdateRutinitas} rutinitas={currentRut} />
        </div>
    );
}
