use anchor_lang::prelude::*;

pub mod mint;
pub mod metadata;
pub mod sell;

use mint::*;
use metadata::*;
use sell::*;

// TODO: Replace
declare_id!("J9FYn1sG3navkfA4y3sjJw56xjqAhei3xoW5QqBqqM8e");

#[program]
pub mod nft_marketplace {
    use super::*;

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

    pub fn sell(
        ctx: Context<SellNft>,
        sell_amount: u64,
    ) -> Result<()> {
        sell::sell(ctx, sell_amount)
    }

    // TODO:
    // pub fn list(
    //     ctx: Context<ListNfts>,
    // ) -> Result<()> {
    //     // TODO: See whether that will be correct
    //     // list::list(ctx, sell_amount)
    //     Ok(())
    // }
}
