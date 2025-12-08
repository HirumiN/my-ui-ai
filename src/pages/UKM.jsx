import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

const UKM = () => {
  const [ukmList, setUkmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { impersonatedUser } = useUser();

  const [newUkm, setNewUkm] = useState({
    nama: '',
    jabatan: '',
    deskripsi: '',
    id_user: impersonatedUser?.id_user || '', // Default to empty string if no user impersonated
  });
  const [addingUkm, setAddingUkm] = useState(false);
  const [addUkmError, setAddUkmError] = useState(null);
  const [deleteUkmError, setDeleteUkmError] = useState(null);

  const fetchUkmList = useCallback(async () => {
    if (!impersonatedUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8000/ukm?id_user=${impersonatedUser.id_user}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUkmList(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [impersonatedUser]); // Added impersonatedUser to dependency array

  useEffect(() => {
    fetchUkmList();
  }, [fetchUkmList]);

  useEffect(() => {
    setNewUkm((prev) => ({ ...prev, id_user: impersonatedUser?.id_user || '' }));
  }, [impersonatedUser]);

  const handleNewUkmChange = (e) => {
    const { name, value } = e.target;
    setNewUkm((prevUkm) => ({ ...prevUkm, [name]: value }));
  };

  const handleAddUkm = async (e) => {
    e.preventDefault();
    setAddingUkm(true);
    setAddUkmError(null);

    if (!impersonatedUser) {
      setAddUkmError('Please impersonate a user to add an UKM entry.');
      setAddingUkm(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      for (const key in newUkm) {
        if (newUkm[key]) {
          formData.append(key, newUkm[key]);
        }
      }
      formData.set('id_user', impersonatedUser.id_user); // Ensure id_user is set from impersonated user

      const response = await fetch('http://localhost:8000/add-ukm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewUkm({
        nama: '',
        jabatan: '',
        deskripsi: '',
        id_user: impersonatedUser?.id_user || '',
      });
      await fetchUkmList(); // Refresh UKM list
    } catch (error) {
      setAddUkmError(error.message);
    } finally {
      setAddingUkm(false);
    }
  };

  const handleDeleteUkm = async (ukmId) => {
    setDeleteUkmError(null);
    if (!impersonatedUser) {
        setDeleteUkmError('Please impersonate a user to delete an UKM entry.');
        return;
    }
    try {
      const response = await fetch(`http://localhost:8000/delete-ukm/${ukmId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchUkmList(); // Refresh UKM list
    } catch (error) {
      setDeleteUkmError(error.message);
    }
  };

  if (!impersonatedUser) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Unit Kegiatan Mahasiswa (UKM)</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">No user impersonated.</p>
          <p>Please go to the "Users" page to select a user to manage UKM entries.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading UKM...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Unit Kegiatan Mahasiswa (UKM)</h1>

      {impersonatedUser && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p className="font-bold">Currently viewing UKM for:</p>
          <p>{impersonatedUser.nama} (ID: {impersonatedUser.id_user})</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-3">All UKM</h2>
        {ukmList.length === 0 ? (
          <p>No UKM found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {ukmList.map((ukm) => (
              <li key={ukm.id_ukm} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{ukm.nama} ({ukm.jabatan})</p>
                  <p className="text-sm text-gray-500">{ukm.deskripsi}</p>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={() => handleDeleteUkm(ukm.id_ukm)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {deleteUkmError && <p className="text-red-500 text-sm mt-2">Error deleting UKM: {deleteUkmError}</p>}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Add New UKM</h2>
        <form onSubmit={handleAddUkm} className="space-y-4">
          <div>
            <label htmlFor="ukmNama" className="block text-sm font-medium text-gray-700">UKM Name</label>
            <input
              type="text"
              name="nama"
              id="ukmNama"
              value={newUkm.nama}
              onChange={handleNewUkmChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="ukmJabatan" className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              name="jabatan"
              id="ukmJabatan"
              value={newUkm.jabatan}
              onChange={handleNewUkmChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="ukmDeskripsi" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="deskripsi"
              id="ukmDeskripsi"
              value={newUkm.deskripsi}
              onChange={handleNewUkmChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            disabled={addingUkm}
          >
            {addingUkm ? 'Adding UKM...' : 'Add UKM'}
          </button>
          {addUkmError && <p className="text-red-500 text-sm mt-2">Error adding UKM: {addUkmError}</p>}
        </form>
      </div>
    </div>
  );
};

export default UKM;