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

  deleteRoadmap: async (roadmapId) => {
    const response = await client.delete(`/api/roadmaps/${roadmapId}`);
    return response.data;
  },

  getCareerProgress: async () => {
    const response = await client.get(`/api/career-progress`);
    return response.data;
  },

  updateCareerProgress: async (progressId, status) => {
    const response = await client.put(`/api/career-progress/${progressId}`, { status });
    return response.data;
  },

  // ── NEW: Step CRUD ──
  completeStep: async (stepId) => {
    const response = await client.patch(`/api/roadmap/steps/${stepId}/complete`);
    return response.data;
  },

  editStep: async (stepId, data) => {
    const response = await client.patch(`/api/roadmap/steps/${stepId}`, data);
    return response.data;
  },

  addStep: async (data) => {
    const response = await client.post(`/api/roadmap/steps`, data);
    return response.data;
  },

  deleteStep: async (stepId) => {
    const response = await client.delete(`/api/roadmap/steps/${stepId}`);
    return response.data;
  },

  // ── NEW: Skill Gap ──
  getSkillGap: async () => {
    const response = await client.get(`/api/skill-gap`);
    return response.data;
  },

  // ── NEW: Adapt Roadmap (Preview Mode) ──
  adaptRoadmapPreview: async (roadmapId, userMessage) => {
    const response = await client.post(`/api/roadmap/${roadmapId}/adapt/preview`, { user_message: userMessage });
    return response.data;
  },

  adaptRoadmapApply: async (roadmapId, changes) => {
    const response = await client.post(`/api/roadmap/${roadmapId}/adapt/apply`, changes);
    return response.data;
  },
};

export default careerService;
