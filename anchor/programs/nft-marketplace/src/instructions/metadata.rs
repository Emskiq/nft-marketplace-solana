use {
    anchor_lang::{
        prelude::*,
    },
    anchor_spl::{
        token::Token,
        metadata::{
            create_metadata_accounts_v3,
            CreateMetadataAccountsV3,
            create_master_edition_v3,
            CreateMasterEditionV3,
            Metadata,
            mpl_token_metadata::types::{
                DataV2, Creator
            },
        },
    }
};


pub fn create_metadata(
    ctx: Context<CreateMetadata>,
    title: String,
    uri: String,
) -> Result<()> {
    msg!("Creating metadata account...");
    msg!("Metadata account address: {}", &ctx.accounts.metadata.to_account_info().key());
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.metadata.to_account_info(),
            CreateMetadataAccountsV3{
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                payer: ctx.accounts.mint_authority.to_account_info(),
                mint_authority: ctx.accounts.mint_authority.to_account_info(),
                update_authority: ctx.accounts.mint_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            }
        ),
        DataV2 {
            name: title,
            symbol: "REAL-EST".to_string(),
            uri: uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![
                Creator {
                    address: ctx.accounts.mint_authority.key(),
                    verified: true,
                    share: 100,
                },
            ]),
            collection: None,
            uses: None,
        },
        true,
        true,
        None,
    )?;

    msg!("Creating master edition metadata account...");
    msg!("Master edition metadata account address: {}", &ctx.accounts.master_edition.to_account_info().key());
    create_master_edition_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3{
                edition: ctx.accounts.master_edition.to_account_info(),
                payer: ctx.accounts.mint_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                mint_authority: ctx.accounts.mint_authority.to_account_info(),
                update_authority: ctx.accounts.mint_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            }),
            Some(1),
    )?;

    msg!("Minted NFT successfully");

    emit!(MetadataCreatedEvent{
        mint: ctx.accounts.mint.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    #[account(mut)]
    pub mint: Signer<'info>,

    #[account(mut)]
    pub mint_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"metadata".as_ref(), token_metadata_program.key().as_ref(), mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK: Metaplex will do the check
    pub metadata: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"metadata".as_ref(), token_metadata_program.key().as_ref(), mint.key().as_ref(), b"edition".as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    /// CHECK:
    pub master_edition: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[event]
pub struct MetadataCreatedEvent {
    pub mint: Pubkey,
}
