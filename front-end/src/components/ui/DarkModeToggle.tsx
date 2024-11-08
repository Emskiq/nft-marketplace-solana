// src/components/ui/DarkModeToggle.tsx
import React, { useEffect, useState } from 'react'

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
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

