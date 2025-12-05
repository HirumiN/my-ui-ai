import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">My App</h1>
        <div className="space-x-4">
          <a href="#notifications" className="text-gray-600 hover:text-gray-900">Notifications</a>
          <a href="#user" className="text-gray-600 hover:text-gray-900">User</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
