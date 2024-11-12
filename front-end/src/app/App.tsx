// src/app/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from '../components/ui/Navbar'
import Home from '../components/pages/Home'
import Profile from '../components/pages/Profile'
import Mint from '../components/pages/Mint'
import NftDetail from '../components/pages/NftDetail'

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/nft/:id" element={<NftDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
