// components/backtologin.tsx

import React from 'react';
import loginIcon from '../login-icon.png';  // ✅ important: ../

const BackToLogin: React.FC = () => {
  const handleClick = () => {
    window.history.back();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
    >
      <span className="text-lg" aria-hidden="true">
        ←
      </span>

      <img
        src={loginIcon}
        alt="Login"
        className="w-6 h-6 object-contain"
      />

      <span>Back to login</span>
    </button>
  );
};

export default BackToLogin;
