import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { AddTodoModal, EditTodoModal } from '../components/TodoModals';
import { Plus, Edit, Trash2, ListTodo, Calendar, Flag } from 'lucide-react';

const PRIORITIES = ['Semua', 'Tinggi', 'Menengah', 'Rendah'];

const PRIORITY_STYLES = {
    'Tinggi':   { badge: 'bg-red-100 text-red-700',    border: 'border-l-red-500',    dot: 'bg-red-500'    },
    'Menengah': { badge: 'bg-yellow-100 text-yellow-700', border: 'border-l-yellow-400', dot: 'bg-yellow-400' },
    'Rendah':   { badge: 'bg-green-100 text-green-700', border: 'border-l-green-500',  dot: 'bg-green-500'  },
};

const getPriorityStyle = (tipe) => PRIORITY_STYLES[tipe] ?? { badge: 'bg-gray-100 text-gray-600', border: 'border-l-gray-300', dot: 'bg-gray-400' };

export default function Todos() {
    const { impersonatedUser } = useUser();
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterPriority, setFilterPriority] = useState('Semua');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);

    const fetchTodos = useCallback(async () => {
        if (!impersonatedUser) { setTodos([]); setLoading(false); return; }
        setLoading(true);
        try {
            const response = await dataService.getTodos();
            setTodos(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [impersonatedUser]);

    useEffect(() => { fetchTodos(); }, [fetchTodos]);

    const handleAddTodo    = async (data) => { await dataService.createTodo({ ...data, id_user: impersonatedUser.id_user }); fetchTodos(); };
    const handleUpdateTodo = async (data) => { await dataService.updateTodo(data.id_todo, { ...data, id_user: impersonatedUser.id_user }); fetchTodos(); };
    const handleDeleteTodo = async (id)   => { if (window.confirm('Hapus task ini?')) { await dataService.deleteTodo(id); fetchTodos(); } };
    const openEditModal    = (todo)        => { setCurrentTodo(todo); setIsEditModalOpen(true); };

    const filtered = filterPriority === 'Semua' ? todos : todos.filter(t => t.tipe === filterPriority);

    // Summary counts
    const counts = todos.reduce((acc, t) => { acc[t.tipe] = (acc[t.tipe] || 0) + 1; return acc; }, {});

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><ListTodo /> Todolist</h2>
                    <p className="text-gray-500 text-sm">Kelola tugas dan tenggat waktu kamu</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
                    disabled={!impersonatedUser}
                >
                    <Plus size={18} /> Tambah Task
                </button>
            </div>

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
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterPriority === p ? 'bg-black text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {p !== 'Semua' && <Flag size={12} />}
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {!impersonatedUser ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg" role="alert">
                    <p>Silakan login untuk mengelola todolist.</p>
                </div>
            ) : loading ? (
                <p className="text-gray-500">Memuat tugas...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : filtered.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed">
                    <ListTodo className="mx-auto mb-2 text-gray-300" size={40} />
                    <p className="text-gray-500">{filterPriority === 'Semua' ? 'Belum ada task.' : `Tidak ada task prioritas "${filterPriority}".`}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((tugas) => {
                        const style = getPriorityStyle(tugas.tipe);
                        return (
                            <div key={tugas.id_todo} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 ${style.border}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-base leading-snug">{tugas.nama}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2 ${style.badge}`}>
                                        {tugas.tipe || '—'}
                                    </span>
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
                                    <button onClick={() => openEditModal(tugas)}
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

            <AddTodoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddTodo={handleAddTodo}
                impersonatedUser={impersonatedUser}
            />
            <EditTodoModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdateTodo={handleUpdateTodo}
                todo={currentTodo}
            />
        </div>
    );
}
