import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import DarkModeToggle from './DarkModeToggle'

const Navbar: React.FC = () => {
  const location = useLocation()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Side: Logo or Brand */}
          <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white">
                  Real Estate NFTs
              </Link>
          </div>

          {/* Middle: Navigation Links */}
          <div className="hidden md:flex space-x-4">
            <NavLink to="/" currentPath={location.pathname}>
              Home
            </NavLink>
            <NavLink to="/mint" currentPath={location.pathname}>
              Mint
            </NavLink>
            <NavLink to="/profile" currentPath={location.pathname}>
              Profile
            </NavLink>
          </div>

          {/* Right Side: Wallet Button and Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-4 !py-2 !rounded-md" />
          </div>
        </div>
      </div>
    </nav>
  )
}

interface NavLinkProps {
  to: string
  children: React.ReactNode
  currentPath: string
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, currentPath }) => {
  const isActive = currentPath === to

  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      {children}
    </Link>
  )
}

export default Navbar
