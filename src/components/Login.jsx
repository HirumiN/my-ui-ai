import { useState } from 'react';
import authService from '../services/authService';

const Login = ({ onLogin }) => {
  // We keep mock login for quick testing/fallback if needed, but primary is Google
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const handleMockLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      // In a real app we might not have this, or we check against a simple local DB
      onLogin();
    }
  };

  const handleGoogleLogin = () => {
    authService.login(); // Redirects to backend
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center mb-6 text-2xl font-bold text-gray-800">Login to Campus AI</h2>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-50 transition duration-300 flex items-center justify-center gap-2 mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with demo account</span>
          </div>
        </div>

        <form onSubmit={handleMockLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">Demo Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
