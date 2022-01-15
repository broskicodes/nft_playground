import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import React, { useCallback } from 'react';
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import idl from "../../idl.json";
import { Idl, Program, Provider, web3, BN } from '@project-serum/anchor';
import solKP from '../../keypairs/solKeypair.json';

const programAddress =  new PublicKey(idl.metadata.address);
const appAccount = Keypair.fromSecretKey(Uint8Array.from(Object.values(solKP._keypair.secretKey)));


export const Minter = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const walletObj = useAnchorWallet();

    const getProvider = () => {
      if(!walletObj){
        return
      }
      const provider = new Provider(
        connection, walletObj, { preflightCommitment: "confirmed" },
      );
      return provider;
    }

    const mintNFT = async () => {
      if(!publicKey){
        return;
      }

      const provider = getProvider();
      const program = new Program(idl, programAddress, provider)

      const data = {
        name: 'Code Monkey Dao Membership NFT',
        symbol: '',
        uri: 'https://arweave.net/Au_vyhLJlliPRunU7BH2SAZxBO_naOfZErPuVnoB29s',
        sellerFeeBasisPoints: 0,
        primarySaleHappened: false,
      }

      let enc = new TextEncoder();

      const mint = await Token.createMint(
        connection, 
        appAccount, 
        walletObj.publicKey, 
        null, 0, 
        TOKEN_PROGRAM_ID
      );

      const to = await mint.getOrCreateAssociatedAccountInfo(walletObj.publicKey);

      // const mint = await createMint(provider, provider.wallet.publicKey);
      // const to = await createTokenAccount(provider, mint, provider.wallet.publicKey);
      const tokenMetadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");


      const [metadata, bump] = await PublicKey.findProgramAddress(
        [
          // edition,
          enc.encode('metadata'),
          tokenMetadataProgram.toBytes(),
          mint.publicKey.toBytes()
        ],
        tokenMetadataProgram
      );
      const [edition, bump2] = await PublicKey.findProgramAddress(
        [
          enc.encode('metadata'),
          tokenMetadataProgram.toBytes(),
          mint.publicKey.toBytes(),
          enc.encode('edition'),
        ],
        tokenMetadataProgram
      );

      await program.rpc.proxyMintTo(new BN(1), {
        accounts: {
          authority: provider.wallet.publicKey,
          mint: mint.publicKey,
          to: to.address,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });

      await program.rpc.proxyMintNft(
        data.name,
        data.symbol,
        data.uri,
        data.sellerFeeBasisPoints,
        true,
        false,
        null,
        {
          accounts: {
            tokenMetadataProgram,
            metadata,
            mint: mint.publicKey,
            edition,
            mintAuthority: provider.wallet.publicKey,
            payer: provider.wallet.publicKey,
            updateAuthority: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: web3.SYSVAR_RENT_PUBKEY,
          },
        }
      );
    }

    return (
        <button onClick={mintNFT} disabled={!publicKey}>
          Press
        </button>
        // <button onClick={}
    );
};