import { NavLink } from "react-router-dom";
import { Home, MessageSquare, User, LogOut, CheckSquare, GraduationCap, Briefcase, Map } from "lucide-react";

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
        <CheckSquare size={18} /> Todolist
      </NavLink>

      <NavLink
        to="/akademik"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-100"
          }`
        }
      >
        <GraduationCap size={18} /> Akademik
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
        to="/career-analysis"
        className={({ isActive }) =>
          `flex items-center gap-3 p-2 rounded-lg font-medium cursor-pointer ${isActive ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50"
          }`
        }
      >
        <Briefcase size={18} /> Karir & Roadmap
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

      <button
        onClick={onLogout}
        className="flex items-center gap-3 p-2 text-red-500 mt-4 hover:bg-red-50 rounded-lg"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
