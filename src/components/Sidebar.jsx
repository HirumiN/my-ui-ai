import { NavLink } from "react-router-dom";
import { Home, MessageSquare, User, LogOut, Briefcase, Sparkles, Calendar as CalendarIcon, X } from "lucide-react";

const navItems = [
  { to: "/", end: true, icon: Home, label: "Dashboard" },
  { to: "/planner", end: false, icon: CalendarIcon, label: "Planner & Agenda" },
  { to: "/career-analysis", end: false, icon: Briefcase, label: "Karir & Roadmap" },
  { to: "/chat-ai", end: false, icon: Sparkles, label: "Chat AI" },
  { to: "/profile", end: false, icon: User, label: "Profil" },
];

export default function Sidebar({ isOpen, onClose, onLogout }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 flex flex-col h-full bg-white border-r border-emerald-100 text-slate-700 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/30">
              <Sparkles size={18} className="text-emerald-950 font-bold" />
            </div>
            <div>
              <p className="text-emerald-950 font-bold text-sm leading-tight">Campus AI</p>
              <p className="text-slate-600 text-[11px]">Academic Assistant</p>
            </div>
          </div>
          
          {/* Tombol close di mobile */}
          <button 
            onClick={onClose}
            className="p-1 md:hidden rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600 px-3 pb-2">Menu</p>
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose} // Tutup laci otomatis di hp saat navigasi ditekan
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-emerald-100 text-emerald-700" : "text-slate-600 group-hover:text-emerald-700 group-hover:bg-emerald-50"}`}>
                    <Icon size={15} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <LogOut size={15} />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

