import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Metaplex } from '@metaplex-foundation/js'
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

const NftDetail: React.FC = () => {
  const { mintAddress } = useParams<{ mintAddress: string }>()
  const [nft, setNft] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const wallet = useAnchorWallet()

  useEffect(() => {
    const fetchNft = async () => {
      setLoading(true)
      const connection = new Connection(clusterApiUrl('devnet'))
      const metaplex = new Metaplex(connection)
      const nft = await metaplex.nfts().findByMint({
        mintAddress: new PublicKey(mintAddress),
      })
      setNft(nft)
      setLoading(false)
    }

    fetchNft()
  }, [mintAddress])

  const buyNft = async () => {
    // Implement the buying logic
  }

  if (loading) {
    return <div>Loading NFT...</div>
  }

  if (!nft) {
    return <div>NFT not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <img className="w-full" src={nft.image} alt={nft.name} />
      <h1 className="text-3xl font-bold my-4">{nft.name}</h1>
      <p>{nft.description}</p>
      <button
        onClick={buyNft}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Buy NFT
      </button>
    </div>
  )
}

export default NftDetail

