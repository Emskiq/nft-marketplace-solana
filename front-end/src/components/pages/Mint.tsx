// src/components/pages/Mint.tsx
import React, { useState } from 'react'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
  Transaction,
  SYSVAR_RENT_PUBKEY,
  clusterApiUrl,
} from '@solana/web3.js'
import { AnchorProvider, utils } from '@coral-xyz/anchor'
import Input from '../ui/Input'
import { getNftMarketplaceProgram, TOKEN_METADATA_PROGRAM_ID } from '../../api/nftMarketplaceExports'
import Modal from '../ui/Modal'

const network = clusterApiUrl('devnet')
const opts: { preflightCommitment: 'processed' } = { preflightCommitment: 'processed' }

const Mint: React.FC = () => {
  const wallet = useAnchorWallet()
  const { connected } = useWallet()

  // State variables for the form inputs
  const [nftTitle, setNftTitle] = useState('')
  const [nftPrice, setNftPrice] = useState('')
  const [nftUri, setNftUri] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)

  const getProvider = (): AnchorProvider | null => {
    if (!wallet) return null
    const connection = new Connection(network, opts.preflightCommitment)
    return new AnchorProvider(connection, wallet, opts)
  }

  const mintNft = async () => {
    setError('')
    setMessage('')
    setIsLoading(true)

    if (!wallet || !connected) {
      setError('Wallet is not connected.')
      setIsLoading(false)
      return
    }

    const provider = getProvider()
    if (!provider) {
      setError('Provider is not available.')
      setIsLoading(false)
      return
    }

    const program = getNftMarketplaceProgram(provider)

    try {
      const walletPublicKey = wallet.publicKey!

      const mintKeypair = Keypair.generate()

      const tokenAddress = await utils.token.associatedAddress({
        mint: mintKeypair.publicKey,
        owner: walletPublicKey,
      })

      console.log(`New token: ${mintKeypair.publicKey.toBase58()}`)
      console.log(`Token address: ${tokenAddress.toBase58()}`)

      // Derive the metadata address
      const [metadataAddress] = await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      console.log(`Metadata address: ${metadataAddress.toBase58()}`)

      // Derive the master edition address
      const [masterEditionAddress] = await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      console.log(`Master edition address: ${masterEditionAddress.toBase58()}`)

      const transaction = new Transaction()

      const mintInstruction = await program.methods
        .mint()
        .accounts({
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAddress,
          mintAuthority: walletPublicKey,
        })
        .instruction()

      transaction.add(mintInstruction)

      // Add the 'createMetadata' instruction
      const createMetadataInstruction = await program.methods
        .createMetadata(nftTitle, nftUri)
        .accounts({
          mint: mintKeypair.publicKey,
          mintAuthority: walletPublicKey,
          metadata: metadataAddress,
          masterEdition: masterEditionAddress,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .instruction()

      transaction.add(createMetadataInstruction)

      // Send the transaction
      const signature = await provider.sendAndConfirm(transaction, [mintKeypair])

      console.log('NFT Minted Successfully!', signature)
      setMessage('NFT Minted Successfully!')

      // Construct the Solana Explorer URL
      const mintAddress = mintKeypair.publicKey.toBase58()
      const explorerLink = `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`

      // Set the modal content and open the modal
      setModalContent(
        <div>
          <h2 className="text-lg font-semibold mb-4">NFT Minted Successfully!</h2>
          <p>Your NFT has been minted successfully.</p>
          <p>
            View it on Solana Explorer:{' '}
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {mintAddress}
            </a>
          </p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      )
      setIsModalOpen(true)
    } catch (err: any) {
      console.error('Error minting NFT', err)
      setError('Failed to mint NFT.')

      // Set the modal content for the error and open the modal
      setModalContent(
        <div>
          <h2 className="text-lg font-semibold mb-4">Error Minting NFT</h2>
          <p>{err.message || 'An error occurred while minting the NFT.'}</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      )
      setIsModalOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Mint Your NFT</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mintNft()
        }}
        className="w-full max-w-md bg-white dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <Input
          label="NFT Title"
          id="nftTitle"
          type="text"
          value={nftTitle}
          onChange={(e) => setNftTitle(e.target.value)}
          required
          placeholder="Enter NFT title"
        />
        <Input
          label="NFT Price (SOL)"
          id="nftPrice"
          type="number"
          value={nftPrice}
          onChange={(e) => setNftPrice(e.target.value)}
          required
          placeholder="Enter price in SOL"
          min="0"
          step="0.01"
        />
        <Input
          label="Metadata URI"
          id="nftUri"
          type="text"
          value={nftUri}
          onChange={(e) => setNftUri(e.target.value)}
          required
          placeholder="Enter metadata URI"
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      </form>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  )
}

export default Mint

