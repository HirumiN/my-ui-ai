import React, { useState, useEffect } from 'react';

export const AddTodoModal = ({ isOpen, onClose, onAddTodo, impersonatedUser }) => {
    const [newTodo, setNewTodo] = useState({
        nama: '',
        tipe: '',
        tenggat: '',
        deskripsi: '',
        id_user: impersonatedUser?.id_user || '',
    });
    const [addingTodo, setAddingTodo] = useState(false);
    const [addTodoError, setAddTodoError] = useState(null);

    useEffect(() => {
        setNewTodo((prev) => ({ ...prev, id_user: impersonatedUser?.id_user || '' }));
    }, [impersonatedUser]);

    const handleNewTodoChange = (e) => {
        const { name, value } = e.target;
        setNewTodo((prevTodo) => ({ ...prevTodo, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAddingTodo(true);
        setAddTodoError(null);
        try {
            await onAddTodo(newTodo);
            onClose();
            // Reset form
            setNewTodo({
                nama: '',
                tipe: '',
                tenggat: '',
                deskripsi: '',
                id_user: impersonatedUser?.id_user || '',
            });
        } catch (error) {
            setAddTodoError(error.message);
        } finally {
            setAddingTodo(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Tambah Todo Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="todoNama" className="block text-sm font-medium text-gray-700">Task Name</label>
                        <input
                            type="text"
                            name="nama"
                            id="todoNama"
                            value={newTodo.nama}
                            onChange={handleNewTodoChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="todoTipe" className="block text-sm font-medium text-gray-700">Prioritas</label>
                        <select
                            name="tipe"
                            id="todoTipe"
                            value={newTodo.tipe}
                            onChange={handleNewTodoChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="">Pilih prioritas</option>
                            <option value="Tinggi">🔴 Tinggi</option>
                            <option value="Menengah">🟡 Menengah</option>
                            <option value="Rendah">🟢 Rendah</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="todoTenggat" className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                            type="datetime-local"
                            name="tenggat"
                            id="todoTenggat"
                            value={newTodo.tenggat}
                            onChange={handleNewTodoChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="todoDeskripsi" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="deskripsi"
                            id="todoDeskripsi"
                            value={newTodo.deskripsi}
                            onChange={handleNewTodoChange}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            disabled={addingTodo}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            disabled={addingTodo}
                        >
                            {addingTodo ? 'Adding...' : 'Add Task'}
                        </button>
                    </div>
                    {addTodoError && <p className="text-red-500 text-sm mt-2">{addTodoError}</p>}
                </form>
            </div>
        </div>
    );
};

export const EditTodoModal = ({ isOpen, onClose, onUpdateTodo, todo }) => {
    const [editedTodo, setEditedTodo] = useState(todo || {});
    const [updatingTodo, setUpdatingTodo] = useState(false);
    const [updateTodoError, setUpdateTodoError] = useState(null);

    useEffect(() => {
        setEditedTodo(todo || {});
    }, [todo]);

    const handleEditTodoChange = (e) => {
        const { name, value } = e.target;
        setEditedTodo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdatingTodo(true);
        setUpdateTodoError(null);
        try {
            await onUpdateTodo(editedTodo);
            onClose();
        } catch (error) {
            setUpdateTodoError(error.message);
        } finally {
            setUpdatingTodo(false);
        }
    };

    if (!isOpen || !todo) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Todo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Ensure ID is preserved in state */}
                    <input type="hidden" name="id_todo" value={editedTodo.id_todo || ''} />
                    <div>
                        <label htmlFor="editTodoNama" className="block text-sm font-medium text-gray-700">Task Name</label>
                        <input
                            type="text"
                            name="nama"
                            id="editTodoNama"
                            value={editedTodo.nama || ''}
                            onChange={handleEditTodoChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="editTodoTipe" className="block text-sm font-medium text-gray-700">Prioritas</label>
                        <select
                            name="tipe"
                            id="editTodoTipe"
                            value={editedTodo.tipe || ''}
                            onChange={handleEditTodoChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="">Pilih prioritas</option>
                            <option value="Tinggi">🔴 Tinggi</option>
                            <option value="Menengah">🟡 Menengah</option>
                            <option value="Rendah">🟢 Rendah</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="editTodoTenggat" className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                            type="datetime-local"
                            name="tenggat"
                            id="editTodoTenggat"
                            value={editedTodo.tenggat ? new Date(editedTodo.tenggat).toISOString().slice(0, 16) : ''}
                            onChange={handleEditTodoChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="editTodoDeskripsi" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="deskripsi"
                            id="editTodoDeskripsi"
                            value={editedTodo.deskripsi || ''}
                            onChange={handleEditTodoChange}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            disabled={updatingTodo}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            disabled={updatingTodo}
                        >
                            {updatingTodo ? 'Updating...' : 'Update Task'}
                        </button>
                    </div>
                    {updateTodoError && <p className="text-red-500 text-sm mt-2">{updateTodoError}</p>}
                </form>
            </div>
        </div>
    );
};
