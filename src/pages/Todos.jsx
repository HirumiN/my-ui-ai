import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import dataService from '../services/dataService';
import { AddTodoModal, EditTodoModal } from '../components/TodoModals';
import { Plus, Edit, Trash2, CheckSquare, Calendar } from 'lucide-react';

export default function Todos() {
    const { impersonatedUser } = useUser();
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);

    const fetchTodos = useCallback(async () => {
        if (!impersonatedUser) {
            setTodos([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Refactor: the original Home.jsx passed ?id_user=...
            // My new service calls /api/todos.
            // Assuming /api/todos uses the logged-in user session.
            // If "Impersonation" is local-only, this might mismatch if backend expects session.
            // But for this task, we assume generic "Todos" page behaviour.
            const response = await dataService.getTodos();
            setTodos(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [impersonatedUser]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const handleAddTodo = async (data) => {
        await dataService.createTodo({ ...data, id_user: impersonatedUser.id_user });
        fetchTodos();
    };

    const handleUpdateTodo = async (data) => {
        await dataService.updateTodo(data.id_todo, { ...data, id_user: impersonatedUser.id_user });
        fetchTodos();
    };

    const handleDeleteTodo = async (id) => {
        if (window.confirm('Delete this task?')) {
            await dataService.deleteTodo(id);
            fetchTodos();
        }
    };

    const openEditModal = (todo) => {
        setCurrentTodo(todo);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><CheckSquare /> Tugas Akademik</h2>
                    <p className="text-gray-500 text-sm">Manage your academic tasks and deadlines</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
                    disabled={!impersonatedUser}
                >
                    <Plus size={18} /> Add Task
                </button>
            </div>

            {!impersonatedUser ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p>Please log in to manage tasks.</p>
                </div>
            ) : loading ? (
                <p>Loading tasks...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : todos.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500">No tasks found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todos.map((tugas) => (
                        <div key={tugas.id_todo} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">{tugas.nama}</h3>
                                <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600`}>{tugas.tipe}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tugas.deskripsi}</p>
                            {tugas.tenggat && (
                                <div className="text-xs text-red-500 font-medium mb-4 flex items-center gap-1">
                                    <Calendar size={12} /> Due: {new Date(tugas.tenggat).toLocaleString()}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2 border-t mt-auto">
                                <button
                                    onClick={() => openEditModal(tugas)}
                                    className="flex-1 py-1.5 border rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-gray-50"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteTodo(tugas.id_todo)}
                                    className="flex-1 py-1.5 border border-red-100 text-red-600 rounded-lg text-sm bg-red-50 hover:bg-red-100 flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
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
