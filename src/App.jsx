import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import ChatAI from "./pages/ChatAI";
import Profile from "./pages/Profile";
import Dashboard from "./components/Dashboard"
import Home from "./pages/Home";
import Users from "./pages/Users";
import UKM from "./pages/UKM";
import Todos from "./pages/Todos";
import Jadwal from "./pages/Jadwal";
import Semesters from "./pages/Semesters";
import { UserProvider } from './contexts/UserContext';
import authService from './services/authService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.checkAuth();
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      }
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <UserProvider initialUser={currentUser}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<Dashboard onLogout={handleLogout} />}
              >
                <Route index element={<Home />} />
                <Route path="chat-ai" element={<ChatAI />} />
                <Route path="profile" element={<Profile />} />
                <Route path="users" element={<Users />} />
                <Route path="ukm" element={<UKM />} />
                <Route path="todos" element={<Todos />} />
                <Route path="jadwal" element={<Jadwal />} />
                <Route path="semesters" element={<Semesters />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      )}
    </div>
  );
}

export default App;
