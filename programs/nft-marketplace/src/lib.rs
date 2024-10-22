use anchor_lang::prelude::*;

declare_id!("J9FYn1sG3navkfA4y3sjJw56xjqAhei3xoW5QqBqqM8e");

#[program]
pub mod nft_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Starting of Emskiq NFT Marketplace");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
