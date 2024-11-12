import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { PublicKey } from '@solana/web3.js';
import { fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';

interface NftData {
    id: number;
    mint_address: string;
    owner_address: string;
    price: number;
}

interface JsonMetadata {
    name: string;
    symbol: string;
    description?: string;
    image?: string;
    // Add other fields as necessary
}

const NftDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [nft, setNft] = useState<NftData | null>(null);
    const [jsonMetadata, setJsonMetadata] = useState<JsonMetadata | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { publicKey } = useWallet();

    useEffect(() => {
        const fetchNft = async () => {
            try {
                // Fetch NFT data from backend
                const response = await axios.get(`http://localhost:5000/get-nft/${id}`);
                const nftData = response.data as NftData;
                setNft(nftData);

                // Fetch metadata
                const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
                const mintAddress = new PublicKey(nftData.mint_address);

                const asset = await fetchDigitalAsset(umi, mintAddress);

                if (asset.metadata.uri) {
                    const metadataResponse = await fetch(asset.metadata.uri);
                    const jsonData = await metadataResponse.json();

                    setJsonMetadata({
                        name: jsonData.name,
                        symbol: jsonData.symbol,
                        description: jsonData.description,
                        image: jsonData.image,
                        // Add other fields as necessary
                    });
                }
            } catch (error) {
                console.error('Error fetching NFT details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNft();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Loading NFT details...</p>
            </div>
        );
    }

    if (!nft || !jsonMetadata) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Failed to load NFT details.</p>
            </div>
        );
    }

    const isOwner = publicKey?.toBase58() === nft.owner_address;

    const handleBuy = () => {
        // Implement buy functionality
        alert('Buy functionality not implemented yet.');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <img
                    src={jsonMetadata.image || ''}
                    alt={jsonMetadata.name || 'NFT Image'}
                    className="w-full h-auto object-cover rounded"
                />
                <div className="mt-6">
                    <h2 className="text-2xl font-bold mb-2">
                        {jsonMetadata.name || 'Untitled NFT'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {jsonMetadata.description || 'No description available.'}
                    </p>
                    <p className="text-lg font-semibold mb-4">Price: {nft.price} SOL</p>
                    <p className="text-sm text-gray-500 mb-2">Symbol: {jsonMetadata.symbol}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Mint Address: {nft.mint_address}
                    </p>
                    {!isOwner && (
                        <button
                            onClick={handleBuy}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Buy NFT
                        </button>
                    )}
                    {isOwner && (
                        <p className="text-green-500 font-semibold">
                            You are the owner of this NFT.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NftDetail;
