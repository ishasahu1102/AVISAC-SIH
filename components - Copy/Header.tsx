import React from 'react';
import { Globe, ArrowLeft, LogIn } from 'lucide-react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';

interface HeaderProps {
  currentLang: string;
  onLangChange: (code: string) => void;
  canGoBack: boolean;
  onBack: () => void;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLangChange,
  canGoBack,
  onBack,
  onLoginClick,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Back + App logo/title */}
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">
              AI
            </div>
            <span className="hidden sm:block font-bold text-lg tracking-tight text-slate-800">
              DBT Form Filler
            </span>
          </div>
        </div>

        {/* Right: Language selector + Back to Login + App avatar */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700">
              <Globe className="w-4 h-4" />
              {LANGUAGES.find((l: Language) => l.code === currentLang)?.name || 'Language'}
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block max-h-64 overflow-y-auto z-50">
              {LANGUAGES.map((lang: Language) => (
                <button
                  key={lang.code}
                  onClick={() => onLangChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 ${
                    currentLang === lang.code
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  {lang.name}{' '}
                  <span className="text-xs opacity-70 ml-1">({lang.nativeName})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Back to Login */}
          <button
            onClick={onLoginClick}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Back to Login
          </button>

          {/* Right-Aligned App Logo */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <img
              src="https://picsum.photos/200/200?random=5"
              alt="App Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
