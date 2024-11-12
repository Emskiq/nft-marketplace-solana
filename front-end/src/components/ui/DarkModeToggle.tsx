// src/components/ui/DarkModeToggle.tsx
import React, { useEffect, useState } from 'react'

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const storedMode = localStorage.getItem('theme')
    return storedMode === 'dark' ? true : false
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 bg-gray-200 dark:bg-gray-700 rounded"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}

export default DarkModeToggle
