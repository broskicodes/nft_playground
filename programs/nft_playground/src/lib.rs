use anchor_lang::prelude::*;


pub mod token;
use token::*;

pub mod nft;
use nft::*;

declare_id!("EwqRHfatAThKS5omRMFBRdNtntVD4CqgyXfiDiwvh2Cm");

#[program]
pub mod nft_playground {
    use super::*;

    pub fn proxy_transfer(ctx: Context<ProxyTransfer>, amount: u64) -> ProgramResult {
      token::proxy_transfer(ctx, amount)
    }
    
    pub fn proxy_mint_to(ctx: Context<ProxyMintTo>, amount: u64) -> ProgramResult {
      token::proxy_mint_to(ctx, amount)
    }
    
    pub fn proxy_burn(ctx: Context<ProxyBurn>, amount: u64) -> ProgramResult {
      token::proxy_burn(ctx, amount)
    }
    
    pub fn proxy_set_authority(
      ctx: Context<ProxySetAuthority>, 
      authority_type: AuthorityType, 
      new_authority: Option<Pubkey>
    ) -> ProgramResult {
      token::proxy_set_authority(ctx, authority_type, new_authority)
    }

    pub fn proxy_mint_nft(
      ctx: Context<MintNft>, 
      name: String, 
      symbol: String,
      uri: String,
      // creators: Option<Vec<Creator>>,
      seller_fee_basis_points: u16,
      update_authority_is_signer: bool,
      is_mutable: bool,
      max_supply: Option<u64>
    ) -> ProgramResult {
      nft::mint_nft(
        ctx, name, symbol,
        uri, // creators,
        seller_fee_basis_points,
        update_authority_is_signer,
        is_mutable, max_supply,
      )
    }

    // pub fn proxy_create_master(
    //   ctx: Context<CreateMaster>, 
    //   max_supply: Option<u64>
    // ) -> ProgramResult {
    //   nft::create_master(ctx, max_supply)
    // }

    // pub fn mint_master(ctx: Context<MintMaster>) -> ProgramResult {
    //   let _base_account = &mut ctx.accounts.base_account;

    //   Ok(())
    // }
}



// #[account]
// pub struct BaseAccount {

// }