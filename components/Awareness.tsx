import React from 'react';
import { Info, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface AwarenessProps {
  lang: string;
  onStart: () => void;
}

const Awareness: React.FC<AwarenessProps> = ({ lang, onStart }) => {
  // Fallback to English if lang not found in mock dictionary
  const content = TRANSLATIONS[lang]?.awareness || TRANSLATIONS['en'].awareness;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {content.title}
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-400 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Info className="w-6 h-6" />
            </div>
            <XCircle className="w-5 h-5 text-slate-300" />
          </div>
          <h3 className="font-bold text-lg mb-2">{content.p1t}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{content.p1b}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
           <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2">{content.p2t}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{content.p2b}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
           <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="px-2 py-1 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded uppercase">
                Goal
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2 text-emerald-900">{content.p3t}</h3>
          <p className="text-emerald-800 text-sm leading-relaxed">{content.p3b}</p>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onStart}
          className="group bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-3"
        >
          {content.cta || 'Start Form Filling'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Awareness;
