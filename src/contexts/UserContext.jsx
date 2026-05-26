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
      console.error("[CAMPUS AI - ERROR DETAILS]", err);
      
      const responseData = err.response?.data;
      const status = err.response?.status;
      const detailMsg = responseData?.detail || err.message;
      
      console.warn("⚠️ [CAMPUS AI - API DETAILS] ⚠️");
      console.warn(`Status Code: ${status}`);
      console.warn(`Detail Message:`, responseData);
      
      let friendlyError = 'Gagal menghubungi AI. Layanan sedang sibuk atau kuota habis.';
      
      if (status === 401) {
        friendlyError = 'Sesi tidak valid. Silakan login ulang.';
      } else if (status === 429 || (detailMsg && (detailMsg.toLowerCase().includes("quota") || detailMsg.toLowerCase().includes("rate limit") || detailMsg.toLowerCase().includes("exhausted") || detailMsg.toLowerCase().includes("429")))) {
        friendlyError = '⚠️ Kuota API Gemini Anda Telah Habis atau Kena Limit (Rate Limit - 429). Silakan tunggu beberapa saat sebelum mencoba lagi atau ganti dengan API Key yang valid.';
        console.warn("❌ [CAMPUS AI - LIMIT EXCEEDED] Akun Gemini Anda mencapai batas limit kuota pemakaian harian/menit (RESOURCE_EXHAUSTED).");
      } else if (detailMsg && detailMsg.toLowerCase().includes("leaked")) {
        friendlyError = '🔒 Keamanan API Key Terdeteksi Kebocoran (Leaked Key). Google memblokir kunci ini demi keamanan. Harap ganti API Key Anda di file .env.';
        console.warn("❌ [CAMPUS AI - LEAKED KEY DETECTED] Google menonaktifkan API Key ini karena terdeteksi bocor di public repository.");
      } else if (detailMsg && (detailMsg.toLowerCase().includes("api key not valid") || detailMsg.toLowerCase().includes("invalid"))) {
        friendlyError = '🔑 API Key Gemini Tidak Valid. Periksa penulisan kunci API di file .env Anda.';
        console.warn("❌ [CAMPUS AI - INVALID API KEY] API Key yang diinput tidak dikenali oleh Google Cloud Console.");
      } else {
        friendlyError = `Gagal melakukan analisis karir: ${detailMsg}`;
      }
      
      setCareerError(friendlyError);
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