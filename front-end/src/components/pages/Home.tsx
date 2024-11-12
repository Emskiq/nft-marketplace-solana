import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NftCard from '../ui/NftCard'; // Adjust the import based on your file structure

interface Nft {
    id: number;
    mint_address: string;
    owner_address: string;
}

const Home: React.FC = () => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNfts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-nfts');
        setNfts(response.data);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNfts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">No NFTs found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">NFT Marketplace</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <NftCard key={nft.id} nft={nft} />
        ))}
      </div>
    </div>
  );
};

export default Home;

