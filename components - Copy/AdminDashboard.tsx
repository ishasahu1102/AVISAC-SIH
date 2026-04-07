import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, FileCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

const DATA = [
  { name: 'Mon', users: 400, dbt: 240 },
  { name: 'Tue', users: 300, dbt: 139 },
  { name: 'Wed', users: 200, dbt: 980 },
  { name: 'Thu', users: 278, dbt: 390 },
  { name: 'Fri', users: 189, dbt: 480 },
];

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
          <button onClick={onBack} className="text-sm text-indigo-600 hover:underline">Back to App</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm">Total Applicants</span>
                <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold">12,450</h3>
            <p className="text-xs text-green-500 mt-1">+12% this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm">Forms Generated</span>
                <FileCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold">8,320</h3>
            <p className="text-xs text-green-500 mt-1">65% conversion</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm">OCR Failures</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold">142</h3>
            <p className="text-xs text-red-500 mt-1">Requires manual review</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 text-sm">Audit Logs</span>
                <ShieldCheck className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold">Secure</h3>
            <p className="text-xs text-slate-400 mt-1">Immutable storage active</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[300px]">
          <h3 className="font-bold text-slate-700 mb-4">Application Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dbt" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
