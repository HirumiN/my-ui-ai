import client from '../api/client';

const checkAuth = async () => {
    try {
        const response = await client.get('/api/me');
        return response.data;
    } catch (error) {
        return null;
    }
};

const login = async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
};

const register = async ({ nama, email, password }) => {
    const response = await client.post('/auth/register', { nama, email, password });
    return response.data;
};

const logout = async () => {
    try {
        await client.post('/auth/logout');
    } catch (_) {}
    // Force reload to clear all state
    window.location.href = '/';
};

export default {
    checkAuth,
    login,
    register,
    logout
};
