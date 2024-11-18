use anchor_lang::prelude::*;

use crate::instructions::*;

pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("hPd5fM2UuWmU36aE1Cx3HmhScY9fWFswVwe53R2HWZs");

#[program]
pub mod nft_marketplace {
    use super::*;

    // XXX: These 2 intructions - mint and metadata were
    //      separated because transaction size was exceeded
    pub fn mint(
        ctx: Context<MintNft>,
    ) -> Result<()> {
        mint::mint(ctx)
    }

    pub fn create_metadata(
        ctx: Context<CreateMetadata>,
        title: String,
        uri: String,
    ) -> Result<()> {
        metadata::create_metadata(ctx, title, uri)
    }

    // List NFT for sale
    pub fn list_nft(
        ctx: Context<ListNft>,
        price: u64,
    ) -> Result<()> {
        list::list_nft(ctx, price)
    }

    // Buy listed NFT
    pub fn buy_nft(
        ctx: Context<BuyNft>,
    ) -> Result<()> {
        buy::buy(ctx)
    }
}
