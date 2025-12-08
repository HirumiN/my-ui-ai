import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import ChatAI from "./pages/ChatAI";
import Profile from "./pages/Profile";
import Dashboard from "./components/Dashboard"
import Home from "./pages/Home";
import Users from "./pages/Users";
import UKM from "./pages/UKM";
import { UserProvider } from './contexts/UserContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <UserProvider>
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
              </Route>            </Routes>
          </BrowserRouter>
        </UserProvider>
      )}
    </div>
  );
}

export default App;
