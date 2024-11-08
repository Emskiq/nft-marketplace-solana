// src/pages/Home.tsx
import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Welcome to the NFT Marketplace</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">Start minting your unique NFTs today!</p>
    </div>
  )
}

export default Home

