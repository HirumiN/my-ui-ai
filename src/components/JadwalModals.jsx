import React, { useState, useEffect } from 'react';

export const AddJadwalModal = ({ isOpen, onClose, onAddJadwal, impersonatedUser, daysOfWeek, semesterId }) => {
    const [newJadwal, setNewJadwal] = useState({
        nama: '',
        hari: '',
        jam_mulai: '',
        jam_selesai: '',
        sks: 0,
        id_user: impersonatedUser?.id_user || '',
        id_semester: semesterId || ''
    });
    const [addingJadwal, setAddingJadwal] = useState(false);
    const [addJadwalError, setAddJadwalError] = useState(null);

    useEffect(() => {
        setNewJadwal((prev) => ({
            ...prev,
            id_user: impersonatedUser?.id_user || '',
            id_semester: semesterId || ''
        }));
    }, [impersonatedUser, semesterId]);

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
            // Reset
            setNewJadwal({
                nama: '',
                hari: '',
                jam_mulai: '',
                jam_selesai: '',
                sks: 0,
                id_user: impersonatedUser?.id_user || '',
                id_semester: semesterId || ''
            });
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="jadwalJamMulai" className="block text-sm font-medium text-gray-700">Start Time</label>
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
                            <label htmlFor="jadwalJamSelesai" className="block text-sm font-medium text-gray-700">End Time</label>
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
                            {addingJadwal ? 'Adding...' : 'Add Schedule'}
                        </button>
                    </div>
                    {addJadwalError && <p className="text-red-500 text-sm mt-2">{addJadwalError}</p>}
                </form>
            </div>
        </div>
    );
};

export const EditJadwalModal = ({ isOpen, onClose, onUpdateJadwal, jadwalItem, daysOfWeek }) => {
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="editJadwalJamMulai" className="block text-sm font-medium text-gray-700">Start Time</label>
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
                            <label htmlFor="editJadwalJamSelesai" className="block text-sm font-medium text-gray-700">End Time</label>
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
                            {updatingJadwal ? 'Updating...' : 'Update Schedule'}
                        </button>
                    </div>
                    {updateJadwalError && <p className="text-red-500 text-sm mt-2">{updateJadwalError}</p>}
                </form>
            </div>
        </div>
    );
};
