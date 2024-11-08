import { UiLayout } from '@/components/ui/ui-layout'
import { lazy } from 'react'
import { Navigate, RouteObject, useRoutes } from 'react-router-dom'
import Home from '../components/ui/HomePage'
import Profile from '../components/ui/Profile'

const MintNft = lazy(() => import('../components/nftMarketplace/MintNft'))
const NftDetails = lazy(() => import('../components/nftMarketplave/NftDetails'))

const links: { label: string; path: string }[] = [
  { label: 'RealEstateNfts', path: '/' },
  { label: 'MintRealEstateNft', path: '/mint-real-estate-nft' },
  { label: 'Counter Program', path: '/counter' },
]

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/profile', element: <Profile /> },
  { path: '/mint-real-estate-nft/', element: <MintNft /> },
  { path: '/real-estate-nft/:address', element: <NftDetails /> },
]

export function AppRoutes() {
  const router = useRoutes([
    { index: true, element: <Navigate to={'/dashboard'} replace={true} /> },
    { path: '/dashboard', element: <DashboardFeature /> },
    ...routes,
    { path: '*', element: <Navigate to={'/dashboard'} replace={true} /> },
  ])
  return <UiLayout links={links}>{router}</UiLayout>
}
