import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import client from '../api/client';
import { Lock, RefreshCw, Sparkles } from 'lucide-react';

export default function ChatAI() {
  const { impersonatedUser, careerLoading } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [checkingRoadmap, setCheckingRoadmap] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async (userId) => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await client.get(`/chat-history/${userId}`);
      const chatHistory = response.data;
      setMessages(chatHistory.map(msg => ({ role: msg.role, message: msg.message })));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setHistoryError('Could not load past chat history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (impersonatedUser) {
      loadChatHistory(impersonatedUser.id_user);
    } else {
      setMessages([]); // Clear messages if no user is impersonated
    }
  }, [impersonatedUser]); // Load history when impersonated user changes

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkRoadmapStatus = async () => {
    if (!impersonatedUser) return;
    try {
      const response = await client.get('/api/roadmaps');
      setRoadmaps(response.data);
    } catch (e) {
      console.error("Gagal memeriksa roadmap di Chat AI:", e);
    } finally {
      setCheckingRoadmap(false);
    }
  };

  useEffect(() => {
    if (impersonatedUser) {
      checkRoadmapStatus();
    }
  }, [impersonatedUser]);

  // Auto-polling to unlock Chat AI automatically when background roadmap generation finishes
  useEffect(() => {
    const isOnboardingDone = impersonatedUser?.universitas && impersonatedUser?.jurusan && impersonatedUser?.target_karir;
    if (impersonatedUser && isOnboardingDone && roadmaps.length === 0 && !checkingRoadmap) {
      const interval = setInterval(async () => {
        try {
          const response = await client.get('/api/roadmaps');
          setRoadmaps(response.data);
        } catch (e) {
          console.error(e);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [impersonatedUser, roadmaps, checkingRoadmap]);

  if (!impersonatedUser) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Rekomendasi AI</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">No user impersonated.</p>
          <p>Please go to the "Users" page to select a user to start chatting with the AI.</p>
        </div>
      </div>
    );
  }

  const isOnboardingDone = impersonatedUser?.universitas && impersonatedUser?.jurusan && impersonatedUser?.target_karir;

  if (checkingRoadmap) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 space-y-4">
        <RefreshCw className="animate-spin text-emerald-600" size={36} />
        <p className="text-slate-500 font-semibold text-sm">Memeriksa status asisten AI...</p>
      </div>
    );
  }



  // Warning 3: A new career roadmap is being generated/updated (Roadmap Update Process)
  if (careerLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 sm:p-12 animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 border border-teal-100 rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-6 max-w-xl animate-in zoom-in-95 duration-300">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center bg-teal-100 rounded-2xl text-teal-600">
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">
              Pembaruan Roadmap Karir Sedang Berlangsung
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Anda sedang meminta analisis karir baru! Asisten AI sedang merevisi jalur belajar, merumuskan rekomendasi keterampilan baru, dan menyusun peta jalan belajar Anda.
            </p>
            <p className="text-teal-700 text-xs font-semibold bg-teal-50 py-2 px-4 rounded-xl border border-teal-100 inline-block animate-pulse">
              Sesi konsultasi akan aktif kembali begitu peta karir Anda selesai diperbarui!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            <Sparkles size={12} className="text-teal-500 animate-spin" /> Menyusun Ulang Roadmap Karir...
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loadingResponse) return;

    const userQuestion = input.trim();
    setMessages((prevMessages) => [...prevMessages, { role: 'user', message: userQuestion }]);
    setInput('');
    setLoadingResponse(true);

    const clientLocalTime = new Date().toISOString(); // ISO 8601 format

    try {
      const response = await client.post('/rag/query', {
        id_user: impersonatedUser.id_user,
        question: userQuestion,
        top_k: 5,
        client_local_time: clientLocalTime,
      });

      const data = response.data;
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', message: data.answer }]);
    } catch (error) {
      console.error('[CAMPUS AI - CHAT ERROR]', error);
      const responseData = error.response?.data;
      const status = error.response?.status;
      const detailMsg = responseData?.detail || error.message;

      console.warn("⚠️ [CAMPUS AI - CHAT API DETAILS] ⚠️");
      console.warn(`Status Code: ${status}`);
      console.warn(`Detail Message:`, responseData);

      let botMessage = 'Maaf, terjadi kesalahan saat menghubungi asisten AI kami.';

      if (status === 429 || (detailMsg && (detailMsg.toLowerCase().includes("quota") || detailMsg.toLowerCase().includes("rate limit") || detailMsg.toLowerCase().includes("exhausted") || detailMsg.toLowerCase().includes("429")))) {
        botMessage = '⚠️ **Limit Quota Terlampaui (429)**: Kuota API Gemini Anda saat ini sedang habis atau mencapai batas limit harian. Silakan tunggu beberapa saat atau hubungi administrator untuk menggunakan API Key yang valid.';
        console.warn("❌ [CAMPUS AI - CHAT LIMIT EXCEEDED] Akun Gemini Anda mencapai batas limit kuota pemakaian harian/menit (RESOURCE_EXHAUSTED).");
      } else if (detailMsg && detailMsg.toLowerCase().includes("leaked")) {
        botMessage = '🔒 **Keamanan API Key**: Terdeteksi kebocoran API Key di public repository. Kunci ini diblokir otomatis oleh Google demi keamanan Anda. Harap segera perbarui file `.env` di backend.';
        console.warn("❌ [CAMPUS AI - CHAT LEAKED KEY DETECTED] Google menonaktifkan API Key ini karena terdeteksi bocor di public repository.");
      } else if (detailMsg && (detailMsg.toLowerCase().includes("api key not valid") || detailMsg.toLowerCase().includes("invalid"))) {
        botMessage = '🔑 **API Key Tidak Valid**: Kunci API Google Gemini Anda salah atau tidak terdaftar. Periksa penulisan `GEMINI_API_KEY` di file `.env` backend Anda.';
        console.warn("❌ [CAMPUS AI - CHAT INVALID API KEY] API Key yang diinput tidak dikenali oleh Google Cloud Console.");
      } else {
        botMessage = `⚠️ **Error Backend**: ${detailMsg}`;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', message: botMessage },
      ]);
    } finally {
      setLoadingResponse(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <h1 className="text-2xl font-bold text-slate-800 p-6 pb-2 tracking-tight">Rekomendasi AI</h1>
      <div className="px-6 pb-4">
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl" role="alert">
          <p className="font-bold text-xs uppercase tracking-wider text-emerald-600 mb-1">Konsultasi Sebagai:</p>
          <p className="font-bold text-base">{impersonatedUser.nama}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={msg.id_chat || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-emerald-200' : 'text-emerald-600'}`}>
                {msg.role === 'user' ? 'Anda' : 'Asisten AI'}
              </p>
              <div className="prose prose-sm max-w-none text-inherit">
                {msg.role === 'user' ? (
                  <p className="font-medium">{msg.message}</p>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.message}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loadingResponse && (
          <div className="flex justify-start">
            <div className="max-w-xl p-3 rounded-lg shadow-md bg-gray-200 text-gray-800">
              <strong>AI:</strong> Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loadingResponse}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-300 text-emerald-950 font-bold rounded-lg hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={loadingResponse || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
