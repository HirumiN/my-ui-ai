import { Bell, Search } from "lucide-react";

const Navbar = () => {
  return (
    <header className="w-full bg-white border-b p-4 flex items-center justify-end">
      

      {/* Right items */}
      <div className="flex items-center gap-4">
        <button className="relative hover:bg-gray-100 p-2 rounded-full">
          <Bell size={20} />
        </button>

        <div className="w-9 h-9 bg-gray-300 rounded-full" />
      </div>
    </header>
  );
};

export default Navbar;
