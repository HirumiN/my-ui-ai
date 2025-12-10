import React from 'react';
import { useUser } from '../contexts/UserContext';

export default function Home() {
  const { impersonatedUser } = useUser();

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to My Campus AI</h1>
        <p className="opacity-90">Manage your academic life with the help of AI.</p>
        {impersonatedUser && (
          <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
            Running as: {impersonatedUser.nama}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Links / Dashboard Cards */}
        <DashboardCard
          title="Tugas Akademik"
          desc="Manage your tasks and deadlines"
          link="/todos"
          color="bg-blue-50 border-blue-100 text-blue-700"
        />
        <DashboardCard
          title="Jadwal Kuliah"
          desc="View and edit your class schedule"
          link="/jadwal"
          color="bg-purple-50 border-purple-100 text-purple-700"
        />
        <DashboardCard
          title="Semesters"
          desc="Setup academic years and calendar sync"
          link="/semesters"
          color="bg-emerald-50 border-emerald-100 text-emerald-700"
        />
        <DashboardCard
          title="Chat AI"
          desc="Ask questions about your data"
          link="/chat-ai"
          color="bg-indigo-50 border-indigo-100 text-indigo-700"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, desc, link, color }) {
  return (
    <a href={link} className={`block p-6 rounded-xl border transition-transform hover:-translate-y-1 hover:shadow-md ${color}`}>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-80">{desc}</p>
    </a>
  )
}