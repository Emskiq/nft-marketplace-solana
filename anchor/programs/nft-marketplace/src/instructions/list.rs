use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{
            self, Token, Mint, TokenAccount,
        }
    }
};

use crate::state::*;

pub fn list_nft(
    ctx: Context<ListNft>,
    price: u64,
) -> Result<()> {
    msg!("Listing NFT...");

    // Transfer the NFT from the owner to the program PDA
    // Execute the token transfer (transfer 1 token, which represents the NFT)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.owner_token_account.to_account_info(),
                to: ctx.accounts.pda_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            }),
        1
    )?;

    msg!("Listed NFT transfered ...");
    // Update the Listing Account with the price and owner
    let nft_listing_account = &mut ctx.accounts.nft_listing_account;
    nft_listing_account.owner = ctx.accounts.owner.key();
    nft_listing_account.mint = ctx.accounts.mint.key();
    nft_listing_account.price = price;

    msg!("NFT listed successfully!");
    emit!(NftListedEvent {
        nft: ctx.accounts.mint.key(),
        owner: ctx.accounts.owner.key(),
        marketplace: *ctx.program_id,
        price: price,
    });

    Ok(())
}


#[derive(Accounts)]
pub struct ListNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = owner_token_account.mint == mint.key(),
        constraint = owner_token_account.owner == owner.key(),
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA account for listed NFT, not initialized yet
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + ListedNft::MAX_SIZE,
        seeds = [
            LISTED_NFT_SEED.as_bytes(),
            mint.key().as_ref()
        ],
        bump,
    )]
    pub nft_listing_account: Account<'info, ListedNft>,

    /// CHECK: PDA token account
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = program_pda,
    )]
    pub pda_token_account: Account<'info, TokenAccount>,

    /// CHECK: Program Derived Address
    #[account(
        seeds = [NFT_MARKET_PLACE_SEED.as_bytes()],
        bump,
    )]
    pub program_pda: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct NftListedEvent {
    pub nft: Pubkey,
    pub owner: Pubkey,
    pub marketplace: Pubkey,
    pub price: u64,
}
