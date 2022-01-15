use anchor_lang::prelude::*;
use metaplex_token_metadata::instruction::{ create_metadata_accounts, create_master_edition };
use metaplex_token_metadata::state::{ Creator };
use solana_program::program::invoke;
use anchor_spl::token::Token;


pub fn mint_nft(
  ctx: Context<MintNft>, 
  name: String, 
  symbol: String,
  uri: String,
  // creators: Option<Vec<Creator>>,
  seller_fee_basis_points: u16,
  update_authority_is_signer: bool,
  is_mutable: bool,
  max_supply: Option<u64>, 
) -> ProgramResult {
  let accounts = & ctx.accounts;

  let create_metadata_instruction = create_metadata_accounts(
    *accounts.token_metadata_program.key,
    *accounts.metadata.key,
    *accounts.mint.key,
    *accounts.mint_authority.key,
    *accounts.payer.key,
    *accounts.update_authority.key,
    name,
    symbol,
    uri,
    None,
    seller_fee_basis_points,
    update_authority_is_signer,
    is_mutable,
  );

  let accounts_list: Vec<AccountInfo> = vec![
    accounts.token_metadata_program.to_account_info(),
    accounts.metadata.to_account_info(),
    accounts.mint.to_account_info(),
    accounts.mint_authority.to_account_info(),
    accounts.payer.to_account_info(),
    accounts.update_authority.to_account_info(),
    accounts.system_program.to_account_info(),
    accounts.token_program.to_account_info(),
    accounts.rent.to_account_info(),
  ];

  invoke(
    &create_metadata_instruction, 
    accounts_list.as_slice(),
  )?;

  let create_master_instruction = create_master_edition(
    *accounts.token_metadata_program.key,
    *accounts.edition.key,
    *accounts.mint.key,
    *accounts.update_authority.key,
    *accounts.mint_authority.key,
    *accounts.metadata.key,
    *accounts.payer.key,
    max_supply,
  );

  let accounts_list: Vec<AccountInfo> = vec![
    accounts.token_metadata_program.to_account_info(),
    accounts.metadata.to_account_info(),
    accounts.mint.to_account_info(),
    accounts.mint_authority.to_account_info(),
    accounts.payer.to_account_info(),
    accounts.update_authority.to_account_info(),
    accounts.system_program.to_account_info(),
    accounts.token_program.to_account_info(),
    accounts.rent.to_account_info(),
    accounts.edition.to_account_info(),
  ];

  invoke(
    &create_master_instruction, 
    accounts_list.as_slice(),
  )?;

  Ok(())
}

#[derive(Accounts)]
pub struct MintNft<'info> {
  #[account(mut)]
  pub edition: UncheckedAccount<'info>,
  #[account(mut)]
  pub metadata: UncheckedAccount<'info>,
  #[account(mut)]
  pub mint: UncheckedAccount<'info>,
  pub mint_authority: Signer<'info>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub update_authority: UncheckedAccount<'info>,
  #[account(address = metaplex_token_metadata::id())]
  pub token_metadata_program: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub rent: Sysvar<'info, Rent>
}