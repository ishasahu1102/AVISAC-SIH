import React from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { LANGUAGES } from '../constants';
import loginIcon from '../login-icon.png'; // Correct import path

interface HeaderProps {
  currentLang: string;
  onLangChange: (lang: string) => void;
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
    <header
      className="flex items-center justify-between px-6 py-3 shadow-sm 
                 bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200"
    >
      {/* LEFT — Go Back Button (only appears when canGoBack = true) */}
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 
                       transition-all hover:scale-105"
            title="Go Back"
          >
            <ArrowLeftCircle size={28} />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
        )}
      </div>

      {/* CENTER — Title */}
      <div className="hidden sm:flex items-center justify-center flex-grow">
        <h1 className="text-lg font-semibold text-slate-700 tracking-wide">
          Scholarship Aadhaar DBT Form Assistant
        </h1>
      </div>

      {/* RIGHT — Language Selector & Back to Login */}
      <div className="flex items-center gap-4">
        {/* 🌐 Language Dropdown */}
        <select
          value={currentLang}
          onChange={(e) => onLangChange(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm 
                     bg-white shadow-sm hover:border-indigo-500 focus:outline-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>

        {/* ⬅ Back to Login — Arrow + Text + Image */}
        <button
          onClick={onLoginClick}
          title="Back to Login"
          className="flex items-center gap-2 hover:scale-105 transition"
        >
          {/* Back Arrow */} 
          <ArrowLeftCircle size={24} className="text-slate-700" />

          {/* Text */}
          <span className="text-sm font-medium text-blue-600">
            Back to Login
          </span>

          {/* Login Icon */}
          <img
            src={loginIcon}
            alt="Login"
            className="w-7 h-7 object-contain"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
