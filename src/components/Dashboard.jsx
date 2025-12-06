import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard({ onLogout }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar />
        <main className="p-8">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
