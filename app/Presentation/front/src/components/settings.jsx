import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Русский', value: 'ru' },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  // Заглушки для user info/font size
  const [fontSize, setFontSize] = useState('normal');

  const handleLangChange = (e) => {
    setLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-neutral-900 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Settings</h2>
      <div className="flex flex-col gap-6">
        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <span className="text-lg text-black dark:text-white">Theme</span>
          <button
            className={`px-4 py-2 rounded-lg border border-black dark:border-white transition bg-gray-100 dark:bg-neutral-800 text-black dark:text-white font-semibold focus:outline-none`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
        {/* Language switch */}
        <div className="flex items-center justify-between">
          <span className="text-lg text-black dark:text-white">Language</span>
          <select
            className="dashboard-chart-select"
            value={language}
            onChange={handleLangChange}
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        {/* User info (заглушка) */}
        <div className="flex items-center justify-between">
          <span className="text-lg text-black dark:text-white">User</span>
          <span className="text-gray-500 dark:text-gray-300">(not implemented)</span>
        </div>
        {/* Font size (заглушка) */}
        <div className="flex items-center justify-between">
          <span className="text-lg text-black dark:text-white">Font size</span>
          <span className="text-gray-500 dark:text-gray-300">(not implemented)</span>
        </div>
      </div>
    </div>
  );
}
