import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust if backend is on different port

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
