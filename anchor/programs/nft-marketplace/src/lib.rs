use anchor_lang::prelude::*;

pub mod mint;
pub mod metadata;
pub mod sell;
// pub mod list;

use mint::*;
use metadata::*;
use sell::*;

declare_id!("hPd5fM2UuWmU36aE1Cx3HmhScY9fWFswVwe53R2HWZs");

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
}
