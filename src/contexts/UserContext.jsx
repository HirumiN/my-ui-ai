import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import careerService from '../services/careerService';
import { sendNotification } from '../services/notificationService';

export const UserContext = createContext(null);

export const UserProvider = ({ children, initialUser }) => {
  const [impersonatedUser, setImpersonatedUser] = useState(initialUser || null);

  const CACHE_KEY = impersonatedUser ? `career_analysis_draft_${impersonatedUser.id_user}` : null;

  const [careerResult, setCareerResult] = useState(null);
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerError, setCareerError] = useState(null);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);

  useEffect(() => {
    setImpersonatedUser(initialUser);
  }, [initialUser]);

  // Load cached analysis draft on user change
  useEffect(() => {
    if (impersonatedUser) {
      const key = `career_analysis_draft_${impersonatedUser.id_user}`;
      try {
        const cached = localStorage.getItem(key);
        setCareerResult(cached ? JSON.parse(cached) : null);
      } catch {
        setCareerResult(null);
      }
    } else {
      setCareerResult(null);
    }
  }, [impersonatedUser]);

  // Sync to localStorage
  useEffect(() => {
    if (!CACHE_KEY) return;
    if (careerResult) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(careerResult));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  }, [careerResult, CACHE_KEY]);

  const checkAuth = async () => {
    try {
      const user = await authService.checkAuth();
      setImpersonatedUser(user);
      return user;
    } catch (e) {
      console.error(e);
    }
  };

  const generateCareerAnalysisGlobal = async () => {
    if (!impersonatedUser) return;
    setCareerLoading(true);
    setCareerResult(null);
    setCareerError(null);
    setIsCareerModalOpen(false);
    try {
      const res = await careerService.generateAnalysis(impersonatedUser.id_user);
      setCareerResult(res.data);
      setIsCareerModalOpen(true);
      sendNotification("Analisis Selesai ⚡", {
        body: "AI telah selesai membuat rekomendasi karir dan roadmap Anda."
      });
      return res.data;
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.status === 401
        ? 'Sesi tidak valid. Silakan login ulang.'
        : 'Gagal menghasilkan rekomendasi karir. AI mungkin sedang sibuk.';
      setCareerError(errMsg);
    } finally {
      setCareerLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      impersonatedUser, 
      setImpersonatedUser, 
      checkAuth,
      careerResult,
      setCareerResult,
      careerLoading,
      setCareerLoading,
      careerError,
      setCareerError,
      isCareerModalOpen,
      setIsCareerModalOpen,
      generateCareerAnalysisGlobal
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};