import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar dengan overlay mobile drawer */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={onLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pass toggle handler ke Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


