import React, { useState, useEffect } from 'react';

export const AddSemesterModal = ({ isOpen, onClose, onAddSemester, impersonatedUser }) => {
    const [newSemester, setNewSemester] = useState({
        tipe: 'Ganjil',
        tahun_ajaran: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        id_user: impersonatedUser?.id_user || ''
    });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setNewSemester((prev) => ({ ...prev, id_user: impersonatedUser?.id_user || '' }));
    }, [impersonatedUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewSemester((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError(null);
        try {
            await onAddSemester(newSemester);
            onClose();
            setNewSemester({
                tipe: 'Ganjil',
                tahun_ajaran: '',
                tanggal_mulai: '',
                tanggal_selesai: '',
                id_user: impersonatedUser?.id_user || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add New Semester</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="tipe"
                            value={newSemester.tipe}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Academic Year (e.g., 2025/2026)</label>
                        <input
                            type="text"
                            name="tahun_ajaran"
                            value={newSemester.tahun_ajaran}
                            onChange={handleChange}
                            placeholder="2025/2026"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="tanggal_mulai"
                                value={newSemester.tanggal_mulai}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="tanggal_selesai"
                                value={newSemester.tanggal_selesai}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            disabled={adding}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                            disabled={adding}
                        >
                            {adding ? 'Adding...' : 'Add Semester'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export const EditSemesterModal = ({ isOpen, onClose, onUpdateSemester, semester }) => {
    const [editedSemester, setEditedSemester] = useState(semester || {});
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setEditedSemester(semester || {});
    }, [semester]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedSemester((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        try {
            await onUpdateSemester(editedSemester);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen || !semester) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Semester</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="tipe"
                            value={editedSemester.tipe || 'Ganjil'}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                        <input
                            type="text"
                            name="tahun_ajaran"
                            value={editedSemester.tahun_ajaran || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    {/* Note: Start/End dates usually not editable mid-semester easily if it affects valid logic, but for simple CRUD allowing it */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="tanggal_mulai"
                                value={editedSemester.tanggal_mulai || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="tanggal_selesai"
                                value={editedSemester.tanggal_selesai || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            disabled={updating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            disabled={updating}
                        >
                            {updating ? 'Updating...' : 'Update Semester'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>
        </div>
    );
};
