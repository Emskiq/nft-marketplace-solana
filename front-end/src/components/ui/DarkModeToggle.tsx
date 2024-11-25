import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const storedMode = localStorage.getItem('theme');
    return storedMode === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <SunIcon className="w-6 h-6 text-yellow-500" />
      ) : (
        <MoonIcon className="w-6 h-6 text-gray-800" />
      )}
    </button>
  );
};

export default DarkModeToggle;
