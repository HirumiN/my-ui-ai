import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { Edit, Trash2 } from 'lucide-react'; // Import Edit and Trash2 icons

// Edit User Modal Component
const EditUserModal = ({ isOpen, onClose, onUpdateUser, user }) => {
  const [editedUser, setEditedUser] = useState(user || {});
  const [updatingUser, setUpdatingUser] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    setEditedUser(user || {});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdatingUser(true);
    setUpdateError(null);
    try {
      await onUpdateUser(editedUser);
      onClose();
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setUpdatingUser(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editNama" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="nama"
              id="editNama"
              value={editedUser.nama || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="editEmail"
              value={editedUser.email || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="editTelepon" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="telepon"
              id="editTelepon"
              value={editedUser.telepon || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="editBio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              id="editBio"
              value={editedUser.bio || ''}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          <div>
            <label htmlFor="editLokasi" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="lokasi"
              id="editLokasi"
              value={editedUser.lokasi || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              disabled={updatingUser}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={updatingUser}
            >
              {updatingUser ? 'Updating User...' : 'Update User'}
            </button>
          </div>
          {updateError && <p className="text-red-500 text-sm mt-2">{updateError}</p>}
        </form>
      </div>
    </div>
  );
};


const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { impersonatedUser, setImpersonatedUser } = useUser();

  const [newUser, setNewUser] = useState({
    nama: '',
    email: '',
    telepon: '',
    bio: '',
    lokasi: '',
  });
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const [deleteUserError, setDeleteUserError] = useState(null);

  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);


  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/users'); // Assuming this endpoint exists
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleImpersonate = (user) => {
    setImpersonatedUser(user);
    // Optionally redirect or show a notification
  };

  const handleStopImpersonating = () => {
    setImpersonatedUser(null);
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setAddUserError(null);

    try {
      const formData = new URLSearchParams();
      for (const key in newUser) {
        if (newUser[key]) { // Only append if not empty
          formData.append(key, newUser[key]);
        }
      }

      const response = await fetch('http://localhost:8000/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewUser({
        nama: '',
        email: '',
        telepon: '',
        bio: '',
        lokasi: '',
      });
      await fetchUsers(); // Refresh user list
    } catch (error) {
      setAddUserError(error.message);
    } finally {
      setAddingUser(false);
    }
  };

  const handleUpdateUser = async (updatedUserData) => {
    try {
      const formData = new URLSearchParams();
      for (const key in updatedUserData) {
        if (updatedUserData[key]) {
          formData.append(key, updatedUserData[key]);
        }
      }

      const response = await fetch(`http://localhost:8000/update-user/${updatedUserData.id_user}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchUsers(); // Refresh user list
      // If the updated user is the currently impersonated user, update the context
      if (impersonatedUser && impersonatedUser.id_user === updatedUserData.id_user) {
        setImpersonatedUser(updatedUserData);
      }
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  };


  const handleDeleteUser = async (userId) => {
    setDeleteUserError(null);
    try {
      const response = await fetch(`http://localhost:8000/delete-user/${userId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchUsers(); // Refresh user list
    } catch (error) {
      setDeleteUserError(error.message);
    }
  };

  const openEditUserModal = (user) => {
    setCurrentUser(user);
    setIsEditUserModalOpen(true);
  };


  if (loading) {
    return <div className="p-6">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">User Management</h1>

      {impersonatedUser && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Impersonating User:</p>
          <p>{impersonatedUser.nama} ({impersonatedUser.email})</p>
          <button
            onClick={handleStopImpersonating}
            className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Stop Impersonating
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-3">All Users</h2>
        {users.length === 0 ? (
          <p>No users found. Add a new user below.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id_user} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{user.nama}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => handleImpersonate(user)}
                    disabled={impersonatedUser && impersonatedUser.id_user === user.id_user}
                  >
                    {impersonatedUser && impersonatedUser.id_user === user.id_user ? 'Impersonating' : 'Impersonate'}
                  </button>
                  <button
                    onClick={() => openEditUserModal(user)}
                    className="px-3 py-1 border rounded-lg text-sm flex items-center gap-1"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={() => handleDeleteUser(user.id_user)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {deleteUserError && <p className="text-red-500 text-sm mt-2">Error deleting user: {deleteUserError}</p>}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="nama"
              id="nama"
              value={newUser.nama}
              onChange={handleNewUserChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={newUser.email}
              onChange={handleNewUserChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="telepon" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="telepon"
              id="telepon"
              value={newUser.telepon}
              onChange={handleNewUserChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              id="bio"
              value={newUser.bio}
              onChange={handleNewUserChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          <div>
            <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="lokasi"
              id="lokasi"
              value={newUser.lokasi}
              onChange={handleNewUserChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            disabled={addingUser}
          >
            {addingUser ? 'Adding User...' : 'Add User'}
          </button>
          {addUserError && <p className="text-red-500 text-sm mt-2">Error adding user: {addUserError}</p>}
        </form>
      </div>

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onUpdateUser={handleUpdateUser}
        user={currentUser}
      />
    </div>
  );
};

export default Users;
