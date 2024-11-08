// src/app/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from '../components/ui/Navbar'
import Home from '../components/pages/Home'
import Profile from '../components/pages/Profile'
import Mint from '../components/pages/Mint'

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mint" element={<Mint />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
