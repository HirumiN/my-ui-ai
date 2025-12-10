import { NavLink } from "react-router-dom";
import { Home, MessageSquare, User, LogOut, CheckSquare, BookOpen, Calendar } from "lucide-react";

export default function Sidebar({ onLogout }) {
  return (
    <aside className="w-64 bg-white border-r h-full p-4 space-y-2">

      <h1 className="text-xl font-bold mb-5">Student Dashboard</h1>

      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <Home size={18} /> Dashboard
      </NavLink>

      <NavLink
        to="/todos"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <CheckSquare size={18} /> Tugas Akademik
      </NavLink>

      <NavLink
        to="/jadwal"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <BookOpen size={18} /> Jadwal Kuliah
      </NavLink>

      <NavLink
        to="/semesters"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <Calendar size={18} /> Semesters
      </NavLink>

      <NavLink
        to="/chat-ai"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <MessageSquare size={18} /> Chat AI
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <User size={18} /> Profil
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <User size={18} /> Users
      </NavLink>
      <NavLink
        to="/ukm"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <MessageSquare size={18} /> UKM
      </NavLink>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 p-2 text-red-500 mt-4 hover:bg-red-50 rounded-lg"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
