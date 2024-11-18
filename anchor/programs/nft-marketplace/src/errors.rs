use anchor_lang::prelude::*;

#[error_code]
pub enum NftMarketplaceError {
    #[msg("Insufficient funds to purchase the NFT.")]
    InsufficientFunds,
}
