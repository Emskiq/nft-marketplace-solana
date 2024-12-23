use {
    anchor_lang::{
        prelude::*, solana_program::native_token::LAMPORTS_PER_SOL, system_program
    }, anchor_spl::{
        associated_token::{
            self, AssociatedToken
        },
        token::{
            self, Token,
        }
    }
};


pub fn mint(
    ctx: Context<MintNft>,
) -> Result<()> {

    msg!("Creating mint account...");
    msg!("Mint: {}", &ctx.accounts.mint.key());
    system_program::create_account(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::CreateAccount {
                from: ctx.accounts.mint_authority.to_account_info(),
                to: ctx.accounts.mint.to_account_info(),
            },
        ),
        LAMPORTS_PER_SOL,
        82,
        &ctx.accounts.token_program.key(),
    )?;

    msg!("Initializing mint account...");
    msg!("Mint: {}", &ctx.accounts.mint.key());
    token::initialize_mint(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::InitializeMint {
                mint: ctx.accounts.mint.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        0,
        &ctx.accounts.mint_authority.key(),
        Some(&ctx.accounts.mint_authority.key()),
    )?;

    msg!("Creating token account...");
    msg!("Token Address: {}", &ctx.accounts.token_account.key());    
    associated_token::create(
        CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            associated_token::Create {
                payer: ctx.accounts.mint_authority.to_account_info(),
                associated_token: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            },
        ),
    )?;

    msg!("Minting token to token account...");
    msg!("Mint: {}", &ctx.accounts.mint.to_account_info().key());
    msg!("Token Address: {}", &ctx.accounts.token_account.key());
    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
        ),
        1,
    )?;

    emit!(MintSucessfulEvent {
        mint: ctx.accounts.mint.key(),
        owner: ctx.accounts.mint_authority.key(),
        marketplace: *ctx.program_id,
    });

    Ok(())
}


#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub mint: Signer<'info>,

    #[account(mut)]
    pub mint_authority: Signer<'info>, // or signer/payer

    /// CHECK: We will create it with Anchor
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    // System variable accounts or system programs, that Anchor will automatically deduce"
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[event]
pub struct MintSucessfulEvent {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub marketplace: Pubkey,
}
