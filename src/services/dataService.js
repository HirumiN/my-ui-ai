import client from '../api/client';

// TODOS
const getTodos = () => client.get('/api/todos');
const createTodo = (data) => client.post('/api/todos', data);
const updateTodo = (id, data) => client.put(`/api/todos/${id}`, data);
const deleteTodo = (id) => client.delete(`/api/todos/${id}`);

// JADWAL
const getJadwal = (semesterId = null) => {
    const params = semesterId ? { semester_id: semesterId } : {};
    return client.get('/api/jadwal', { params });
}
const createJadwal = (data) => client.post('/api/jadwal', data);
const updateJadwal = (id, data) => client.put(`/api/jadwal/${id}`, data);
const deleteJadwal = (id) => client.delete(`/api/jadwal/${id}`);

// SEMESTERS
const getSemesters = () => client.get('/api/semesters');
const createSemester = (data) => client.post('/api/semesters', data);
const updateSemester = (id, data) => client.put(`/api/semesters/${id}`, data);
const deleteSemester = (id) => client.delete(`/api/semesters/${id}`);

// USERS
const getUsers = () => client.get('/api/users');
const updateUser = (id, formData) => client.post(`/update-user/${id}`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});

const manualSync = () => client.post('/api/manual-sync');

export default {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    getJadwal,
    createJadwal,
    updateJadwal,
    deleteJadwal,
    getSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
    getUsers,
    updateUser,
    manualSync
};
