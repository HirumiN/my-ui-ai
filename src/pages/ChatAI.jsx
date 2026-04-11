import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';

export default function ChatAI() {
  const { impersonatedUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingResponse, setLoadingResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async (userId) => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`http://localhost:8000/chat-history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chatHistory = await response.json();
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loadingResponse) return;

    const userQuestion = input.trim();
    setMessages((prevMessages) => [...prevMessages, { role: 'user', message: userQuestion }]);
    setInput('');
    setLoadingResponse(true);

    const clientLocalTime = new Date().toISOString(); // ISO 8601 format

    try {
      const response = await fetch('http://localhost:8000/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_user: impersonatedUser.id_user,
          question: userQuestion,
          top_k: 5,
          client_local_time: clientLocalTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', message: data.answer }]);
    } catch (error) {
      console.error('Error fetching RAG query:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', message: 'Error: Could not get a response.' },
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

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id_chat || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl p-3 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-emerald-400 text-emerald-950 font-bold'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.message}
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
