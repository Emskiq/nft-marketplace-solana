import React from 'react'

interface NftCardProps {
  nft: any // Replace with appropriate type from Metaplex SDK
  onClick: () => void
}

const NftCard: React.FC<NftCardProps> = ({ nft, onClick }) => {
  return (
    <div
      className="max-w-sm rounded overflow-hidden shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <img className="w-full" src={nft.image} alt={nft.name} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{nft.name}</div>
        <p className="text-gray-700 text-base">{nft.description}</p>
      </div>
    </div>
  )
}

export default NftCard

