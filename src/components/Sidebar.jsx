import { useState, useEffect } from "react";
import { FiMenu, FiHome, FiUsers, FiBox, FiShoppingCart, FiSettings, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsExpanded(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "dashboard", icon: <FiHome />, label: "Dashboard" },
    { id: "users", icon: <FiUsers />, label: "User Management" },
    { id: "products", icon: <FiBox />, label: "Products" },
    { id: "orders", icon: <FiShoppingCart />, label: "Orders" },
    { id: "settings", icon: <FiSettings />, label: "Settings" },
  ];

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const sidebarVariants = {
    expanded: { width: "250px" },
    collapsed: { width: "64px" },
  };

  const overlayVariants = {
    visible: { opacity: 0.5 },
    hidden: { opacity: 0 },
  };

  return (
    <>
      {isMobile && isExpanded && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black z-20"
          onClick={toggleSidebar}
        />
      )}
      <AnimatePresence>
        <motion.div
          initial={isExpanded ? "expanded" : "collapsed"}
          animate={isExpanded ? "expanded" : "collapsed"}
          variants={sidebarVariants}
          transition={{ duration: 0.3 }}
          className={`fixed left-0 top-0 h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"} 
            shadow-lg z-30 flex flex-col overflow-hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1"
                alt="Company Logo"
                className="h-8 w-8 rounded-full object-cover"
              />
              {isExpanded && (
                <span className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Admin Panel
                </span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors ${isDarkMode ? "text-white" : "text-gray-600"}`}
              aria-label="Toggle Sidebar"
            >
              <FiMenu size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center p-3 transition-all
                  ${!isExpanded ? "justify-center" : "px-4"}
                  ${activeItem === item.id
                    ? `${isDarkMode ? "bg-blue-900" : "bg-blue-50"} ${isDarkMode ? "text-blue-400" : "text-blue-600"}`
                    : `${isDarkMode ? "text-gray-400" : "text-gray-600"} hover:bg-gray-100 dark:hover:bg-gray-800`
                  }`}
                aria-label={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                {isExpanded && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                alt="User Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
              {isExpanded && (
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>John Doe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin</p>
                </div>
              )}
            </div>
            <button
              className={`w-full flex items-center p-3 mt-2 rounded-lg
                ${!isExpanded ? "justify-center" : ""}
                ${isDarkMode ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50"}`}
              aria-label="Logout"
            >
              <FiLogOut size={20} />
              {isExpanded && <span className="ml-3">Logout</span>}
            </button>
          </div>

          {isExpanded && (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              Version 1.0.0
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Sidebar;