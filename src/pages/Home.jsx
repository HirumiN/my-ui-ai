import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { Plus, Edit, Trash2 } from 'lucide-react'; // Import icons

// Modal Components for Tugas Akademik
const AddTodoModal = ({ isOpen, onClose, onAddTodo, impersonatedUser }) => {
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
        <h2 className="text-xl font-semibold mb-4">Add New Tugas Akademik</h2>
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
            <label htmlFor="todoTipe" className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              name="tipe"
              id="todoTipe"
              value={newTodo.tipe}
              onChange={handleNewTodoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="todoTenggat" className="block text-sm font-medium text-gray-700">Due Date (ISO 8601)</label>
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
              {addingTodo ? 'Adding Task...' : 'Add Task'}
            </button>
          </div>
          {addTodoError && <p className="text-red-500 text-sm mt-2">{addTodoError}</p>}
        </form>
      </div>
    </div>
  );
};

const EditTodoModal = ({ isOpen, onClose, onUpdateTodo, todo, impersonatedUser }) => {
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
        <h2 className="text-xl font-semibold mb-4">Edit Tugas Akademik</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="editTodoTipe" className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              name="tipe"
              id="editTodoTipe"
              value={editedTodo.tipe || ''}
              onChange={handleEditTodoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="editTodoTenggat" className="block text-sm font-medium text-gray-700">Due Date (ISO 8601)</label>
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
              {updatingTodo ? 'Updating Task...' : 'Update Task'}
            </button>
          </div>
          {updateTodoError && <p className="text-red-500 text-sm mt-2">{updateTodoError}</p>}
        </form>
      </div>
    </div>
  );
};


// Modal Components for Jadwal Matkul
const AddJadwalModal = ({ isOpen, onClose, onAddJadwal, impersonatedUser, daysOfWeek }) => {
  const [newJadwal, setNewJadwal] = useState({
    nama: '',
    hari: '',
    jam_mulai: '',
    jam_selesai: '',
    sks: 0,
    id_user: impersonatedUser?.id_user || '',
  });
  const [addingJadwal, setAddingJadwal] = useState(false);
  const [addJadwalError, setAddJadwalError] = useState(null);

  useEffect(() => {
    setNewJadwal((prev) => ({ ...prev, id_user: impersonatedUser?.id_user || '' }));
  }, [impersonatedUser]);

  const handleNewJadwalChange = (e) => {
    const { name, value } = e.target;
    setNewJadwal((prevJadwal) => ({ ...prevJadwal, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddingJadwal(true);
    setAddJadwalError(null);
    try {
      await onAddJadwal(newJadwal);
      onClose();
    } catch (error) {
      setAddJadwalError(error.message);
    } finally {
      setAddingJadwal(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Jadwal Matkul</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jadwalNama" className="block text-sm font-medium text-gray-700">Course Name</label>
            <input
              type="text"
              name="nama"
              id="jadwalNama"
              value={newJadwal.nama}
              onChange={handleNewJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="jadwalHari" className="block text-sm font-medium text-gray-700">Day</label>
            <select
              name="hari"
              id="jadwalHari"
              value={newJadwal.hari}
              onChange={handleNewJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select a Day</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="jadwalJamMulai" className="block text-sm font-medium text-gray-700">Start Time (HH:MM)</label>
            <input
              type="time"
              name="jam_mulai"
              id="jadwalJamMulai"
              value={newJadwal.jam_mulai}
              onChange={handleNewJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="jadwalJamSelesai" className="block text-sm font-medium text-gray-700">End Time (HH:MM)</label>
            <input
              type="time"
              name="jam_selesai"
              id="jadwalJamSelesai"
              value={newJadwal.jam_selesai}
              onChange={handleNewJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="jadwalSKS" className="block text-sm font-medium text-gray-700">SKS</label>
            <input
              type="number"
              name="sks"
              id="jadwalSKS"
              value={newJadwal.sks}
              onChange={handleNewJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              disabled={addingJadwal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              disabled={addingJadwal}
            >
              {addingJadwal ? 'Adding Schedule...' : 'Add Schedule'}
            </button>
          </div>
          {addJadwalError && <p className="text-red-500 text-sm mt-2">{addJadwalError}</p>}
        </form>
      </div>
    </div>
  );
};

const EditJadwalModal = ({ isOpen, onClose, onUpdateJadwal, jadwalItem, impersonatedUser, daysOfWeek }) => {
  const [editedJadwal, setEditedJadwal] = useState(jadwalItem || {});
  const [updatingJadwal, setUpdatingJadwal] = useState(false);
  const [updateJadwalError, setUpdateJadwalError] = useState(null);

  useEffect(() => {
    setEditedJadwal(jadwalItem || {});
  }, [jadwalItem]);

  const handleEditJadwalChange = (e) => {
    const { name, value } = e.target;
    setEditedJadwal((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdatingJadwal(true);
    setUpdateJadwalError(null);
    try {
      await onUpdateJadwal(editedJadwal);
      onClose();
    } catch (error) {
      setUpdateJadwalError(error.message);
    } finally {
      setUpdatingJadwal(false);
    }
  };

  if (!isOpen || !jadwalItem) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Jadwal Matkul</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_jadwal" value={editedJadwal.id_jadwal || ''} />
          <div>
            <label htmlFor="editJadwalNama" className="block text-sm font-medium text-gray-700">Course Name</label>
            <input
              type="text"
              name="nama"
              id="editJadwalNama"
              value={editedJadwal.nama || ''}
              onChange={handleEditJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="editJadwalHari" className="block text-sm font-medium text-gray-700">Day</label>
            <select
              name="hari"
              id="editJadwalHari"
              value={editedJadwal.hari || ''}
              onChange={handleEditJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select a Day</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="editJadwalJamMulai" className="block text-sm font-medium text-gray-700">Start Time (HH:MM)</label>
            <input
              type="time"
              name="jam_mulai"
              id="editJadwalJamMulai"
              value={editedJadwal.jam_mulai || ''}
              onChange={handleEditJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="editJadwalJamSelesai" className="block text-sm font-medium text-gray-700">End Time (HH:MM)</label>
            <input
              type="time"
              name="jam_selesai"
              id="editJadwalJamSelesai"
              value={editedJadwal.jam_selesai || ''}
              onChange={handleEditJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="editJadwalSKS" className="block text-sm font-medium text-gray-700">SKS</label>
            <input
              type="number"
              name="sks"
              id="editJadwalSKS"
              value={editedJadwal.sks || 0}
              onChange={handleEditJadwalChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              disabled={updatingJadwal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={updatingJadwal}
            >
              {updatingJadwal ? 'Updating Schedule...' : 'Update Schedule'}
            </button>
          </div>
          {updateJadwalError && <p className="text-red-500 text-sm mt-2">{updateJadwalError}</p>}
        </form>
      </div>
    </div>
  );
};


export default function Home() {
  const { impersonatedUser } = useUser();

  // --- Tugas Akademik State and Logic ---
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [todosError, setTodosError] = useState(null);
  const [deleteTodoError, setDeleteTodoError] = useState(null);
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);
  const [isEditTodoModalOpen, setIsEditTodoModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(null);

  const fetchTodos = useCallback(async () => {
    if (!impersonatedUser) {
      setLoadingTodos(false);
      setTodos([]);
      return;
    }
    setLoadingTodos(true);
    setTodosError(null);
    try {
      const url = `http://localhost:8000/todos?id_user=${impersonatedUser.id_user}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      setTodosError(error.message);
    } finally {
      setLoadingTodos(false);
    }
  }, [impersonatedUser]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (newTodoData) => {
    setTodosError(null);
    if (!impersonatedUser) {
      throw new Error('Please impersonate a user to add a task.');
    }
    try {
      const formData = new URLSearchParams();
      for (const key in newTodoData) {
        if (newTodoData[key]) {
          formData.append(key, newTodoData[key]);
        }
      }
      formData.set('id_user', impersonatedUser.id_user);

      const response = await fetch('http://localhost:8000/add-todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchTodos();
    } catch (error) {
      throw new Error(`Error adding task: ${error.message}`);
    }
  };

  const handleUpdateTodo = async (updatedTodoData) => {
    setTodosError(null);
    if (!impersonatedUser) {
        throw new Error('Please impersonate a user to update a task.');
    }
    try {
      const formData = new URLSearchParams();
      for (const key in updatedTodoData) {
        if (updatedTodoData[key]) {
          formData.append(key, updatedTodoData[key]);
        }
      }
      formData.set('id_user', impersonatedUser.id_user); // Ensure id_user is set from impersonated user

      const response = await fetch(`http://localhost:8000/update-todo/${updatedTodoData.id_todo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchTodos();
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  };


  const handleDeleteTodo = async (todoId) => {
    setDeleteTodoError(null);
    if (!impersonatedUser) {
        setDeleteTodoError('Please impersonate a user to delete a task.');
        return;
    }
    try {
      const response = await fetch(`http://localhost:8000/delete-todo/${todoId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchTodos();
    } catch (error) {
      setDeleteTodoError(error.message);
    }
  };

  const openEditTodoModal = (todo) => {
    setCurrentTodo(todo);
    setIsEditTodoModalOpen(true);
  };


  // --- Jadwal Matkul State and Logic ---
  const [jadwal, setJadwal] = useState([]);
  const [loadingJadwal, setLoadingJadwal] = useState(true);
  const [jadwalError, setJadwalError] = useState(null);
  const [deleteJadwalError, setDeleteJadwalError] = useState(null);
  const [isAddJadwalModalOpen, setIsAddJadwalModalOpen] = useState(false);
  const [isEditJadwalModalOpen, setIsEditJadwalModalOpen] = useState(false);
  const [currentJadwalItem, setCurrentJadwalItem] = useState(null);
  const [filterDay, setFilterDay] = useState('All');
  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];


  const fetchJadwal = useCallback(async () => {
    if (!impersonatedUser) {
      setLoadingJadwal(false);
      setJadwal([]);
      return;
    }
    setLoadingJadwal(true);
    setJadwalError(null);
    try {
      const url = `http://localhost:8000/jadwal?id_user=${impersonatedUser.id_user}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJadwal(data);
    } catch (error) {
      setJadwalError(error.message);
    } finally {
      setLoadingJadwal(false);
    }
  }, [impersonatedUser]);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);


  const handleAddJadwal = async (newJadwalData) => {
    setJadwalError(null);
    if (!impersonatedUser) {
      throw new Error('Please impersonate a user to add a schedule.');
    }
    try {
      const formData = new URLSearchParams();
      for (const key in newJadwalData) {
        if (newJadwalData[key]) {
          formData.append(key, newJadwalData[key]);
        }
      }
      formData.set('sks', parseInt(newJadwalData.sks, 10));
      formData.set('id_user', impersonatedUser.id_user);

      const response = await fetch('http://localhost:8000/add-jadwal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchJadwal();
    } catch (error) {
      throw new Error(`Error adding schedule: ${error.message}`);
    }
  };

  const handleUpdateJadwal = async (updatedJadwalData) => {
    setJadwalError(null);
    if (!impersonatedUser) {
        throw new Error('Please impersonate a user to update a schedule.');
    }
    try {
      const formData = new URLSearchParams();
      for (const key in updatedJadwalData) {
        if (updatedJadwalData[key]) {
          formData.append(key, updatedJadwalData[key]);
        }
      }
      formData.set('sks', parseInt(updatedJadwalData.sks, 10));
      formData.set('id_user', impersonatedUser.id_user);

      const response = await fetch(`http://localhost:8000/update-jadwal/${updatedJadwalData.id_jadwal}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchJadwal();
    } catch (error) {
      throw new Error(`Error updating schedule: ${error.message}`);
    }
  };

  const handleDeleteJadwal = async (jadwalId) => {
    setDeleteJadwalError(null);
    if (!impersonatedUser) {
        setDeleteJadwalError('Please impersonate a user to delete a schedule.');
        return;
    }
    try {
      const response = await fetch(`http://localhost:8000/delete-jadwal/${jadwalId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchJadwal();
    } catch (error) {
      setDeleteJadwalError(error.message);
    }
  };

  const openEditJadwalModal = (jadwalItem) => {
    setCurrentJadwalItem(jadwalItem);
    setIsEditJadwalModalOpen(true);
  };

  const filteredJadwal = jadwal.filter(item => filterDay === 'All' || item.hari === filterDay);


  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ================= LEFT — Tugas Akademik ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">📚 Tugas Akademik</h2>
            <p className="text-gray-500 text-sm">Kelola dan tambahkan tugas kuliah Anda</p>
          </div>
          <button
            onClick={() => setIsAddTodoModalOpen(true)}
            className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
            disabled={!impersonatedUser}
          >
            <Plus size={18} /> Tugas
          </button>
        </div>

        {!impersonatedUser ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">No user impersonated.</p>
            <p>Please go to the "Users" page to select a user to manage academic tasks.</p>
          </div>
        ) : loadingTodos ? (
          <p>Loading academic tasks...</p>
        ) : todosError ? (
          <p className="text-red-500">Error: {todosError}</p>
        ) : todos.length === 0 ? (
          <p>No academic tasks found.</p>
        ) : (
          todos.map((tugas) => (
            <div key={tugas.id_todo} className="border rounded-lg p-4 mb-3">
              <h3 className="font-semibold">{tugas.nama}</h3>
              <p className="text-sm text-gray-600">{tugas.tipe}</p>
              <p className="text-xs text-gray-500">{tugas.deskripsi}</p>
              {tugas.tenggat && <p className="text-xs text-gray-500">Deadline: {new Date(tugas.tenggat).toLocaleString()}</p>}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEditTodoModal(tugas)}
                  className="px-3 py-1 border rounded-lg text-sm flex items-center gap-1"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteTodo(tugas.id_todo)}
                  className="px-3 py-1 border rounded-lg text-sm bg-gray-100 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
        {deleteTodoError && <p className="text-red-500 text-sm mt-2">{deleteTodoError}</p>}
      </div>

      {/* Modals for Tugas Akademik */}
      <AddTodoModal
        isOpen={isAddTodoModalOpen}
        onClose={() => setIsAddTodoModalOpen(false)}
        onAddTodo={handleAddTodo}
        impersonatedUser={impersonatedUser}
      />
      <EditTodoModal
        isOpen={isEditTodoModalOpen}
        onClose={() => setIsEditTodoModalOpen(false)}
        onUpdateTodo={handleUpdateTodo}
        todo={currentTodo}
        impersonatedUser={impersonatedUser}
      />

      {/* ================= RIGHT — Jadwal Kuliah ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">📅 Jadwal Kuliah</h2>
            <p className="text-gray-500 text-sm">Pilih tampilan hari ini atau mingguan</p>
          </div>
          <button
            onClick={() => setIsAddJadwalModalOpen(true)}
            className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
            disabled={!impersonatedUser}
          >
            <Plus size={18} /> Jadwal
          </button>
        </div>

        {!impersonatedUser ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">No user impersonated.</p>
            <p>Please go to the "Users" page to select a user to manage course schedules.</p>
          </div>
        ) : loadingJadwal ? (
          <p>Loading course schedules...</p>
        ) : jadwalError ? (
          <p className="text-red-500">Error: {jadwalError}</p>
        ) : filteredJadwal.length === 0 ? (
          <p>No course schedules found for the selected day.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Schedules</h3>
              <div>
                <label htmlFor="filterDay" className="mr-2 text-gray-700">Filter by Day:</label>
                <select
                  id="filterDay"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm p-1"
                >
                  <option value="All">All</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredJadwal.map((item) => (
                <li key={item.id_jadwal} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium">{item.nama} - {item.hari}</p>
                    <p className="text-sm text-gray-600">{item.jam_mulai} - {item.jam_selesai} ({item.sks} SKS)</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => openEditJadwalModal(item)}
                      className="px-3 py-1 border rounded-lg text-sm flex items-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJadwal(item.id_jadwal)}
                      className="px-3 py-1 border rounded-lg text-sm bg-gray-100 flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {deleteJadwalError && <p className="text-red-500 text-sm mt-2">{deleteJadwalError}</p>}
      </div>

      {/* Modals for Jadwal Matkul */}
      <AddJadwalModal
        isOpen={isAddJadwalModalOpen}
        onClose={() => setIsAddJadwalModalOpen(false)}
        onAddJadwal={handleAddJadwal}
        impersonatedUser={impersonatedUser}
        daysOfWeek={daysOfWeek}
      />
      <EditJadwalModal
        isOpen={isEditJadwalModalOpen}
        onClose={() => setIsEditJadwalModalOpen(false)}
        onUpdateJadwal={handleUpdateJadwal}
        jadwalItem={currentJadwalItem}
        impersonatedUser={impersonatedUser}
        daysOfWeek={daysOfWeek}
      />
    </div>
  );
}