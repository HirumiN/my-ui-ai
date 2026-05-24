import { Bell, Menu } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/":                "Dashboard",
  "/planner":         "Planner & Agenda",
  "/akademik":        "Manajemen Akademik",
  "/chat-ai":         "Rekomendasi AI",
  "/profile":         "Profil Saya",
  "/career-analysis": "Karir & Roadmap",
  "/users":           "Manajemen Users",
};

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ["from-emerald-400 to-yellow-400", "from-rose-400 to-emerald-400", "from-yellow-400 to-emerald-400", "from-slate-500 to-slate-400"];
  const idx = (name || "").charCodeAt(0) % colors.length;
  return colors[idx];
}

const Navbar = ({ onToggleSidebar }) => {
  const { impersonatedUser: user } = useUser();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Tombol hamburger menu khusus mobile */}
        <button 
          onClick={onToggleSidebar}
          className="p-2 md:hidden rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all focus:outline-none"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">{title}</h2>
          <p className="text-[10px] sm:text-[11px] text-slate-600 leading-none mt-0.5">Campus AI Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
        </button>

        {user && (
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(user.nama)} text-emerald-950 font-bold text-xs flex items-center justify-center shadow-md`}>
              {getInitials(user.nama)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user.nama}</p>
              <p className="text-[10px] text-slate-600 leading-tight">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

