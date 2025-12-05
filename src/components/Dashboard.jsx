import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Dashboard = ({ onLogout }) => {
  return (
    <div className="flex h-screen">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 bg-gray-100">
          {/* Page content goes here */}
          <h2>Welcome to the Dashboard</h2>
          <p>This is the main content area.</p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
