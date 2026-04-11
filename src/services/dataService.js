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

// RUTINITAS
const getRutinitas = () => client.get('/api/rutinitas');
const createRutinitas = (data) => client.post('/api/rutinitas', data);
const updateRutinitas = (id, data) => client.put(`/api/rutinitas/${id}`, data);
const deleteRutinitas = (id) => client.delete(`/api/rutinitas/${id}`);

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
    manualSync,
    getRutinitas,
    createRutinitas,
    updateRutinitas,
    deleteRutinitas,
    
    // CURRICULUM
    getCampuses: () => client.get('/api/campuses'),
    getDepartments: (campusId) => client.get(`/api/campuses/${campusId}/departments`),
    getCurricula: (deptId) => client.get(`/api/departments/${deptId}/curricula`),
    connectCurriculum: (params) => client.post('/api/connect-curriculum', null, { params })
};
