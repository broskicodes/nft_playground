// import serumCmn from "@project-serum/common";
// import * as anchor from '@project-serum/anchor';

// export const TokenInstructions = require("@project-serum/serum").TokenInstructions;

//   const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
//   TokenInstructions.TOKEN_PROGRAM_ID.toString()
// );

// export const getTokenAccount = async (provider, addr) => {
//   return await serumCmn.getTokenAccount(provider, addr);
// }

// export const getMintInfo = async (provider, mintAddr) => {
//   return await serumCmn.getMintInfo(provider, mintAddr);
// }

// export const createMint = async (provider, authority) => {
//   if (authority === undefined) {
//     authority = provider.wallet.publicKey;
//   }
//   const mint = anchor.web3.Keypair.generate();
//   const instructions = await createMintInstructions(
//     provider,
//     authority,
//     mint.publicKey
//   );

//   const tx = new anchor.web3.Transaction();
//   tx.add(...instructions);

//   await provider.send(tx, [mint]);

//   return mint.publicKey;
// }

// export const createMintInstructions = async (provider, authority, mint) => {
//   let instructions = [
//     anchor.web3.SystemProgram.createAccount({
//       fromPubkey: provider.wallet.publicKey,
//       newAccountPubkey: mint,
//       space: 82,
//       lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     TokenInstructions.initializeMint({
//       mint,
//       decimals: 0,
//       mintAuthority: authority,
//     }),
//   ];
//   return instructions;
// }

// export const createTokenAccount = async (provider, mint, owner) => {
//   const vault = anchor.web3.Keypair.generate();
//   const tx = new anchor.web3.Transaction();
//   tx.add(
//     ...(await createTokenAccountInstrs(provider, vault.publicKey, mint, owner))
//   );
//   await provider.send(tx, [vault]);
//   return vault.publicKey;
// }

// export const createTokenAccountInstrs = async (
//   provider,
//   newAccountPubkey,
//   mint,
//   owner,
//   lamports
// ) => {
//   if (lamports === undefined) {
//     lamports = await provider.connection.getMinimumBalanceForRentExemption(165);
//   }
//   return [
//     anchor.web3.SystemProgram.createAccount({
//       fromPubkey: provider.wallet.publicKey,
//       newAccountPubkey,
//       space: 165,
//       lamports,
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     TokenInstructions.initializeAccount({
//       account: newAccountPubkey,
//       mint,
//       owner,
//     }),
//   ];
// }

// export const airDropSol = async (wallet, amnt) => {
//   try{
//     const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"), "confirmed");
//     const fromAirDropSigniture = await connection.requestAirdrop(wallet.publicKey, amnt * anchor.web3.LAMPORTS_PER_SOL);
//     await connection.confirmTransaction(fromAirDropSigniture);
//   } catch(e){
//     console.log(e);
//   }
// }

// // module.exports = {
// //   createMint,
// //   createTokenAccount,
// //   TokenInstructions,
// //   getTokenAccount,
// //   getMintInfo,
// //   airDropSol,
// // }