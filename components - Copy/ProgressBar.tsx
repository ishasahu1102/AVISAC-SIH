import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full bg-white p-4 border-b border-slate-200 sticky top-16 z-40">
       <div className="max-w-3xl mx-auto">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-700 uppercase">Form Completion</span>
            <span className="text-xs font-bold text-indigo-700">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          {percentage === 100 && (
             <p className="text-center text-xs text-emerald-600 font-bold mt-2 animate-pulse">
               Ready for Submission!
             </p>
          )}
       </div>
    </div>
  );
};

export default ProgressBar;
