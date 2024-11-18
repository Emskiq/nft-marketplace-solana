import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { PublicKey } from '@solana/web3.js';
import { fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

interface NftData {
    id: number;
    mint_address: string;
    owner_address: string;
    price: string;
}

interface JsonMetadata {
    name: string;
    symbol: string;
    description?: string;
    image?: string;
    // Add other fields as necessary
}

interface NftCardProps {
    nft: NftData;
}

const NftCard: React.FC<NftCardProps> = ({ nft }) => {
    const [jsonMetadata, setJsonMetadata] = useState<JsonMetadata | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata());
                const mintAddress = new PublicKey(nft.mint_address);

                console.log('Fetching NFT metadata...');
                const asset = await fetchDigitalAsset(umi, mintAddress);

                // Log the on-chain metadata
                console.log('Name:', asset.metadata.name);
                console.log('Symbol:', asset.metadata.symbol);
                console.log('URI:', asset.metadata.uri);

                // Fetch the off-chain JSON metadata
                if (asset.metadata.uri) {
                    const response = await fetch(asset.metadata.uri);
                    const jsonData = await response.json();
                    console.log('JSON Metadata:', jsonData);

                    // Set the metadata in state
                    setJsonMetadata({
                        name: asset.metadata.name,
                        symbol: asset.metadata.symbol,
                        description: jsonData.description,
                        image: jsonData.image,
                        // Add other fields as necessary
                    });
                } else {
                    console.error('No metadata URI found.');
                }
            } catch (error) {
                console.error('Error fetching NFT metadata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [nft.mint_address]);

    if (loading) {
        return (
            <div className="border rounded shadow p-4">
                <p>Loading...</p>
            </div>
        );
    }

    if (!jsonMetadata) {
        return (
            <div className="border rounded shadow p-4">
                <p>Failed to load metadata.</p>
            </div>
        );
    }

    return (
        <Link to={`/nft/${nft.id}`}>
            <div className="border rounded shadow hover:shadow-lg transition-shadow duration-200">
                <img
                    src={jsonMetadata.image || ''}
                    alt={jsonMetadata.name || 'NFT Image'}
                    className="w-full h-64 object-cover rounded-t"
                />
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{jsonMetadata.name || 'Untitled NFT'}</h3>
                    <p className="text-gray-600 mb-4">
                        Price: {nft.price} SOL
                    </p>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Symbol:</p>
                        <p className="text-sm text-gray-700 truncate w-40">{jsonMetadata.symbol}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">Mint Address:</p>
                        <p className="text-sm text-gray-700 truncate w-40">{nft.mint_address}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NftCard;
