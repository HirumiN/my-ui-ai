import client from '../api/client';

const checkAuth = async () => {
    try {
        // We use the new /api/me endpoint
        const response = await client.get('/api/me');
        return response.data;
    } catch (error) {
        return null;
    }
};

const login = () => {
    // Redirect to backend auth
    window.location.href = 'http://localhost:8000/login';
};

const logout = async () => {
    window.location.href = 'http://localhost:8000/logout';
};

export default {
    checkAuth,
    login,
    logout
};
