import React, { useState, useEffect } from 'react';

export const AddRutinitasModal = ({ isOpen, onClose, onAddRutinitas, impersonatedUser }) => {
    const [newData, setNewData] = useState({
        nama: '',
        hari: 'Setiap Hari',
        jam_mulai: '',
        jam_selesai: '',
        deskripsi: '',
        id_user: impersonatedUser?.id_user || '',
    });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setNewData((prev) => ({ ...prev, id_user: impersonatedUser?.id_user || '' }));
    }, [impersonatedUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError(null);
        try {
            await onAddRutinitas(newData);
            onClose();
            setNewData({ nama: '', hari: 'Setiap Hari', jam_mulai: '', jam_selesai: '', deskripsi: '', id_user: impersonatedUser?.id_user || '' });
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
                <h2 className="text-xl font-semibold mb-4">Tambah Rutinitas</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Rutinitas</label>
                        <input type="text" name="nama" value={newData.nama} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required placeholder="Lari Pagi" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hari / Jadwal</label>
                        <input type="text" name="hari" value={newData.hari} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required placeholder="Setiap Hari / Senin & Rabu" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jam Mulai</label>
                            <input type="time" name="jam_mulai" value={newData.jam_mulai} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jam Selesai</label>
                            <input type="time" name="jam_selesai" value={newData.jam_selesai} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi Tambahan</label>
                        <textarea name="deskripsi" value={newData.deskripsi} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="2"></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" disabled={adding}>Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600" disabled={adding}>
                            {adding ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export const EditRutinitasModal = ({ isOpen, onClose, onUpdateRutinitas, rutinitas }) => {
    const [editedData, setEditedData] = useState(rutinitas || {});
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setEditedData(rutinitas || {});
    }, [rutinitas]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        try {
            await onUpdateRutinitas(editedData);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen || !rutinitas) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Rutinitas</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Rutinitas</label>
                        <input type="text" name="nama" value={editedData.nama || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hari / Jadwal</label>
                        <input type="text" name="hari" value={editedData.hari || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jam Mulai</label>
                            <input type="time" name="jam_mulai" value={editedData.jam_mulai ? editedData.jam_mulai.slice(0,5) : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jam Selesai</label>
                            <input type="time" name="jam_selesai" value={editedData.jam_selesai ? editedData.jam_selesai.slice(0,5) : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi Tambahan</label>
                        <textarea name="deskripsi" value={editedData.deskripsi || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="2"></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" disabled={updating}>Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600" disabled={updating}>
                            {updating ? 'Update...' : 'Update'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
            </div>
        </div>
    );
};
