use anchor_lang::prelude::*;
use metaplex_token_metadata::instruction::{ 
  create_metadata_accounts, 
  create_master_edition, 
  mint_new_edition_from_master_edition_via_token,
};
// use metaplex_token_metadata::state::{ Creator };
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

  let metadata_accounts_list: Vec<AccountInfo> = vec![
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
    metadata_accounts_list.as_slice(),
  )?;

  let create_master_instruction = create_master_edition(
    *accounts.token_metadata_program.key,
    *accounts.master_edition.key,
    *accounts.mint.key,
    *accounts.update_authority.key,
    *accounts.mint_authority.key,
    *accounts.metadata.key,
    *accounts.payer.key,
    max_supply,
  );

  let edition_accounts_list: Vec<AccountInfo> = vec![
    accounts.token_metadata_program.to_account_info(),
    accounts.metadata.to_account_info(),
    accounts.mint.to_account_info(),
    accounts.mint_authority.to_account_info(),
    accounts.payer.to_account_info(),
    accounts.update_authority.to_account_info(),
    accounts.system_program.to_account_info(),
    accounts.token_program.to_account_info(),
    accounts.rent.to_account_info(),
    accounts.master_edition.to_account_info(),
  ];

  invoke(
    &create_master_instruction, 
    edition_accounts_list.as_slice(),
  )?;

  Ok(())
}

pub fn mint_edition_from_master(
  ctx: Context<MintEditionFromMaster>,
  edition: u64,
) -> ProgramResult {
  let accounts = & ctx.accounts;


  let mint_edition_instruction = mint_new_edition_from_master_edition_via_token(
    *accounts.token_metadata_program.key,
    *accounts.new_metadata.key,
    *accounts.new_edition.key,
    *accounts.master_edition.key,
    *accounts.new_mint.key,
    *accounts.new_mint_authority.key,
    *accounts.payer.key,
    *accounts.token_account_owner.key,
    *accounts.token_account.key,
    *accounts.new_metadata_update_authority.key,
    *accounts.metadata.key,
    *accounts.metadata_mint.key,
    edition,
  );


  let account_list: Vec<AccountInfo> = vec![
    accounts.new_metadata.to_account_info(),
    accounts.new_edition.to_account_info(),
    accounts.master_edition.to_account_info(),
    accounts.new_mint.to_account_info(),
    accounts.edition_mark.to_account_info(),
    accounts.new_mint_authority.to_account_info(),
    accounts.payer.to_account_info(),
    accounts.token_account_owner.to_account_info(),
    accounts.token_account.to_account_info(),
    accounts.new_metadata_update_authority.to_account_info(),
    accounts.metadata.to_account_info(),
    accounts.token_program.to_account_info(),
    accounts.system_program.to_account_info(),
    accounts.rent.to_account_info(),
  ];

  invoke(
    &mint_edition_instruction, 
    account_list.as_slice(),
  )?;

  Ok(())
}

#[derive(Accounts)]
pub struct MintNft<'info> {
  #[account(mut)]
  pub master_edition: UncheckedAccount<'info>,
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

#[derive(Accounts)]
pub struct MintEditionFromMaster<'info> {
  #[account(mut)]
  pub edition_mark: UncheckedAccount<'info>,
  #[account(mut)]
  pub new_edition: UncheckedAccount<'info>,
  #[account(mut)]
  pub master_edition: UncheckedAccount<'info>,
  #[account(mut)]
  pub new_metadata: UncheckedAccount<'info>,
  #[account(mut)]
  pub new_metadata_update_authority: UncheckedAccount<'info>,
  #[account(mut)]
  pub metadata: UncheckedAccount<'info>,
  #[account(mut)]
  pub metadata_mint: UncheckedAccount<'info>,
  #[account(mut)]
  pub new_mint: UncheckedAccount<'info>,
  pub new_mint_authority: Signer<'info>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub token_account_owner: UncheckedAccount<'info>,
  pub token_account: UncheckedAccount<'info>,
  #[account(address = metaplex_token_metadata::id())]
  pub token_metadata_program: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub rent: Sysvar<'info, Rent>
}
