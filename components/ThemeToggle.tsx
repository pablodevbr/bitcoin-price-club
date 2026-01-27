import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-full transition-all duration-300 ease-in-out ${
        darkMode 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-lg shadow-black/50' 
          : 'bg-white text-slate-800 hover:bg-slate-100 shadow-md border border-slate-200'
      }`}
      aria-label="Toggle theme"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};