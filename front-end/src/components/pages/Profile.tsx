import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import NftCard from '../ui/NftCard';

interface NftData {
    mint_address: string;
    owner_address: string;
    price: string;
    listed: boolean;
}

const Profile: React.FC = () => {
    const { publicKey } = useWallet();
    const [nfts, setNfts] = useState<NftData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (publicKey) {
            const ownerAddress = publicKey.toBase58();
            const fetchNfts = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/get-nfts/${ownerAddress}`);
                    setNfts(response.data);
                } catch (error) {
                    console.error('Error fetching NFTs:', error);
                    setError('Failed to fetch NFTs.');
                } finally {
                    setLoading(false);
                }
            };
            fetchNfts();
        } else {
            setLoading(false);
        }
    }, [publicKey]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Loading your NFTs...</p>
            </div>
        );
    }

    if (!publicKey) {
        return (
            <div className="flex flex-col items-center justify-center mt-10">
                <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Your Profile</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Please connect your wallet to view your NFTs.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    if (nfts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center mt-10">
                <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Your Profile</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">You don't own any NFTs yet.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6">Your NFTs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                    <NftCard key={nft.mint_address} nft={nft} />
                ))}
            </div>
        </div>
    );
};

export default Profile;
