import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
} from '@solana/web3.js';
import { fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { getNftMarketplaceProgram } from '../../api/nftMarketplaceExports';
import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

interface NftData {
    mint_address: string;
    owner_address: string;
    price: string;
    listed: boolean;
}

interface JsonMetadata {
    name: string;
    symbol: string;
    description?: string;
    image?: string;
    // Add other fields as necessary
}

const network = clusterApiUrl('devnet');
const opts: { preflightCommitment: 'processed' } = { preflightCommitment: 'processed' };

const NFT_MARKET_PLACE_SEED = "NFT_MARKETPLACE_EMSKIQ";
const LISTED_NFT_SEED = "LISTED_NFT_EMSKIQ_SEED";

const NftDetail: React.FC = () => {
    const { mint } = useParams<{ mint: string }>();
    const [nft, setNft] = useState<NftData | null>(null);
    const [jsonMetadata, setJsonMetadata] = useState<JsonMetadata | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showListModal, setShowListModal] = useState<boolean>(false);
    const [listPrice, setListPrice] = useState<string>('');
    const wallet = useAnchorWallet();
    const { publicKey } = useWallet();

    const getProvider = (connection: Connection): anchor.AnchorProvider | null => {
        if (!wallet) return null;
        return new anchor.AnchorProvider(connection, wallet, opts);
    };

    const fetchNft = async () => {
        try {
            // Fetch NFT data from backend
            const response = await axios.get(`http://localhost:5000/get-nft/${mint}`);
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

    useEffect(() => {
        fetchNft();
    }, [mint]);

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

    const handleBuy = async () => {
        if (!wallet) {
            alert('Please connect your wallet to proceed.');
            return;
        }

        try {
            const connection = new Connection(network, opts.preflightCommitment);
            const provider = getProvider(connection);
            if (!provider) {
                alert('Provider is not available.');
                return;
            }

            const program = getNftMarketplaceProgram(provider);

            const buyerPublicKey = wallet.publicKey;
            const sellerPublicKey = new PublicKey(nft.owner_address);
            const mintPublicKey = new PublicKey(nft.mint_address);

            // Derive PDAs
            const [nftListingAccount] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(LISTED_NFT_SEED), mintPublicKey.toBuffer()],
                program.programId
            );

            const [programPda] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(NFT_MARKET_PLACE_SEED)],
                program.programId
            );

            const buyerTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: buyerPublicKey,
            });

            const pdaTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: programPda,
            });

            const transaction = new Transaction();

            // Execute the transaction
            const buyInstruction = await program.methods.buyNft()
                .accounts({
                    buyer: buyerPublicKey,
                    seller: sellerPublicKey,
                    mint: mintPublicKey,
                    nftListingAccount: nftListingAccount,
                    pdaTokenAccount: pdaTokenAccount,
                    buyerTokenAccount: buyerTokenAccount,
                    programPda: programPda,
                })
                .instruction();

            transaction.add(buyInstruction);

            // Send the transaction
            const signature = await provider.sendAndConfirm(transaction, [])

            // Update the backend
            await axios.post('http://localhost:5000/update-nft', {
                mint_address: nft.mint_address,
                owner_address: buyerPublicKey.toBase58(),
                price: nft.price,
                listed: false,
            });

            alert('NFT purchased successfully!');
            // Refresh the NFT data
            await fetchNft();
        } catch (error) {
            console.error('Error purchasing NFT:', error);
            alert('Failed to purchase NFT. See console for details.');
        }
    };

    const handleList = async () => {
        if (!wallet) {
            alert('Please connect your wallet to proceed.');
            return;
        }

        const price = parseFloat(listPrice);
        if (isNaN(price) || price <= 0) {
            alert('Invalid price.');
            return;
        }

        try {
            const connection = new Connection(network, opts.preflightCommitment);
            const provider = getProvider(connection);
            if (!provider) {
                alert('Provider is not available.');
                return;
            }

            const program = getNftMarketplaceProgram(provider);

            const ownerPublicKey = wallet.publicKey;
            const mintPublicKey = new PublicKey(nft.mint_address);

            // Derive PDAs
            const [nftListingAccount] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(LISTED_NFT_SEED), mintPublicKey.toBuffer()],
                program.programId
            );

            const [programPda] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(NFT_MARKET_PLACE_SEED)],
                program.programId
            );

            const ownerTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: ownerPublicKey,
            });

            const pdaTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintPublicKey,
                owner: programPda,
            });

            const priceInLamports = new anchor.BN(price * anchor.web3.LAMPORTS_PER_SOL);

            // List the NFT
            await program.methods.listNft(priceInLamports)
                .accounts({
                    owner: ownerPublicKey,
                    mint: mintPublicKey,
                    ownerTokenAccount: ownerTokenAccount,
                    nftListingAccount: nftListingAccount,
                    pdaTokenAccount: pdaTokenAccount,
                    programPda: programPda,
                })
                .signers([])
                .rpc();

            // Update the backend
            await axios.post('http://localhost:5000/list-nft', {
                mint_address: nft.mint_address,
                owner_address: ownerPublicKey.toBase58(),
                price: price.toString(),
                listed: true,
            });

            alert('NFT listed successfully!');
            setShowListModal(false);
            // Refresh the NFT data
            await fetchNft();
        } catch (error) {
            console.error('Error listing NFT:', error);
            alert('Failed to list NFT. See console for details.');
        }
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
                    {nft.listed ? (
                        <p className="text-lg font-semibold mb-4">Price: {parseFloat(nft.price)} SOL</p>
                    ) : (
                        <p className="text-lg font-semibold mb-4">This NFT is not listed for sale.</p>
                    )}
                    <p className="text-sm text-gray-500 mb-2">Symbol: {jsonMetadata.symbol}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Mint Address: {nft.mint_address}
                    </p>
                    {!isOwner && nft.listed && (
                        <button
                            onClick={handleBuy}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Buy NFT
                        </button>
                    )}
                    {isOwner && !nft.listed && (
                        <div>
                            <p className="text-green-500 font-semibold">
                                You are the owner of this NFT.
                            </p>
                            <button
                                onClick={() => setShowListModal(true)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
                            >
                                List NFT
                            </button>
                        </div>
                    )}
                    {isOwner && nft.listed && (
                        <p className="text-green-500 font-semibold">
                            You are the owner of this NFT.
                        </p>
                    )}
                    {isOwner && nft.listed && (
                        <span className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Listed for Sale
                        </span>
                    )}
                </div>
            </div>

            {showListModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-4">List NFT for Sale</h2>
                        <input
                            type="number"
                            placeholder="Enter price in SOL"
                            value={listPrice}
                            onChange={(e) => setListPrice(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full mb-4"
                        />
                        <button
                            onClick={handleList}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            List NFT
                        </button>
                        <button
                            onClick={() => setShowListModal(false)}
                            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NftDetail;
