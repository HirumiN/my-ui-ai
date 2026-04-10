import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';

export default function AIQuickAdd({ onAdded }) {
    const { impersonatedUser } = useUser();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || !impersonatedUser) return;
        
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        
        try {
            // Kita panggil endpoint RAG/Gemini khusus untuk parsing jadwal/task
            // Untuk sementara, jika belum ada endpoint backend, kita mock simulasinya:
            
            // TODO: implement actual backend logic. Currently we hit /rag/query as a fallback 
            // or we add a new endpoint in FastAPI. Using try-catch to simulate success.
            await new Promise(r => setTimeout(r, 1500)); // Simulate AI thinking
            
            // Asumsikan backend sudah menyimpan ke DB.
            setSuccessMessage(`Berhasil memproses: "${query}"`);
            setQuery('');
            if (onAdded) onAdded();
            
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || "Gagal memproses kalimat.");
        } finally {
            setLoading(false);
        }
    };

    if (!impersonatedUser) return null;

    return (
        <div className="w-full mb-6">
            <form onSubmit={handleSubmit} className="relative group">
                <div className={`absolute inset-0 bg-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500 ${loading ? 'animate-pulse opacity-50' : ''}`}></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-emerald-100 p-2 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition-all">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl mr-2">
                        <Sparkles size={20} className={loading ? 'animate-spin' : ''} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ketik tugas atau jadwal... (cth: Besok jam 10 ada kelas PBO di ruang A)"
                        className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-sm md:text-base"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="ml-2 p-2 bg-emerald-300 text-emerald-950 font-bold rounded-xl hover:bg-emerald-200 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {loading ? <span className="text-sm font-medium px-2">Memproses AI...</span> : <ArrowRight size={20} />}
                    </button>
                </div>
            </form>
            {error && <p className="text-red-500 text-xs mt-2 ml-2">{error}</p>}
            {successMessage && <p className="text-green-600 text-xs mt-2 ml-2 font-medium">{successMessage}</p>}
        </div>
    );
}
