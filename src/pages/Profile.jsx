import React from 'react';
import { useUser } from '../contexts/UserContext';

export default function Profile() {
  const { impersonatedUser } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">User Profile</h1>

      {impersonatedUser ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Name:</span> {impersonatedUser.nama}
          </p>
          <p className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Email:</span> {impersonatedUser.email}
          </p>
          {impersonatedUser.telepon && (
            <p className="text-lg font-medium text-gray-700">
              <span className="font-semibold">Phone:</span> {impersonatedUser.telepon}
            </p>
          )}
          {impersonatedUser.bio && (
            <p className="text-lg font-medium text-gray-700">
              <span className="font-semibold">Bio:</span> {impersonatedUser.bio}
            </p>
          )}
          {impersonatedUser.lokasi && (
            <p className="text-lg font-medium text-gray-700">
              <span className="font-semibold">Location:</span> {impersonatedUser.lokasi}
            </p>
          )}
          <p className="text-lg font-medium text-gray-700">
            <span className="font-semibold">User ID:</span> {impersonatedUser.id_user}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">No user impersonated.</p>
          <p>Please go to the "Users" page to select a user to impersonate.</p>
        </div>
      )}
    </div>
  );
}
