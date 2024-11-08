import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import NftMarketplaceIDL from './nft_marketplace.json'
import type { NftMarketplace } from './nft_marketplace'

export { NftMarketplace, NftMarketplaceIDL }

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

export const NFTMARKETPLACE_PROGRAM_ID = new PublicKey(NftMarketplaceIDL.address)

export function getNftMarketplaceProgram(provider: AnchorProvider) {
  return new Program(NftMarketplaceIDL, provider) as Program<NftMarketplace>;
}


