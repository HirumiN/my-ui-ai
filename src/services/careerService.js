import client from '../api/client';

const careerService = {
  generateAnalysis: async (userId) => {
    const response = await client.post(`/api/ai/career-analysis/generate?user_id=${userId}`);
    return response.data;
  },

  saveAnalysis: async (userId, data) => {
    const response = await client.post(`/api/ai/career-analysis/save?user_id=${userId}`, data);
    return response.data;
  },

  getRoadmaps: async () => {
    const response = await client.get(`/api/roadmaps`);
    return response.data;
  },

  getRoadmapSteps: async (roadmapId) => {
    const response = await client.get(`/api/roadmaps/${roadmapId}/steps`);
    return response.data;
  },

  getCareerProgress: async () => {
    const response = await client.get(`/api/career-progress`);
    return response.data;
  },

  updateCareerProgress: async (progressId, status) => {
    const response = await client.put(`/api/career-progress/${progressId}`, { status });
    return response.data;
  }
};

export default careerService;
