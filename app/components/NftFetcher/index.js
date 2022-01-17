import { getProvider } from '../../helpers';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Idl, Program, Provider, web3, BN } from '@project-serum/anchor';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";


export const NftFetcher = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const walletObj = useAnchorWallet();
  const [nftMetadata, setNftMetadata] = useState([]);

  const getNfts = async () => {
    let tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey, 
      { 
        programId: TOKEN_PROGRAM_ID,
      }
    );
  
    let nfts = tokenAccounts.value.filter((acc) => {
      let amnt = acc.account.data.parsed.info.tokenAmount;
      return amnt.decimals === 0 && amnt.uiAmount === 1;
    }).map((acc) => {
      return {
        address: acc.pubkey,
        mint: new PublicKey(acc.account.data.parsed.info.mint),
      }
    })

    console.log(nfts);
    
    nfts = await verifyNfts(nfts);

    setNftMetadata(nfts);
  }

  const verifyNfts = async (possibleNfts) => {
    let tokenMetadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    let enc = new TextEncoder();

    // let nfts = [];

    let promises = possibleNfts.map(async (acc) => {
      let [metadataAccount, _] = await PublicKey.findProgramAddress(
        [
          enc.encode('metadata'),
          tokenMetadataProgram.toBytes(),
          acc.mint.toBytes(),
        ],
        tokenMetadataProgram,
      );

      let metadata = null;
      try {
        metadata = await Metadata.load(connection, metadataAccount);
        // nfts.push(metadata);
        return metadata
      } catch(e) {
        return null;
      }
    });

    possibleNfts = await Promise.all(promises);

    let nfts = possibleNfts.filter((item) => item);
    console.log(nfts);

    return nfts;
  }
  

  useEffect(async () => {
    // const onLoad = async () => {
      await getNfts();
    // };
    // window.addEventListener('load', onLoad);
    // return () => window.removeEventListener('load', onLoad);
  }
  , []);

  return (
    <div>
      {nftMetadata.length > 0 && <ul>
        {nftMetadata.map((mtd) => {
          return (
            <li>
              {mtd.pubkey.toString()}
            </li>
          )
        })}
      </ul>}
    </div>
  )
}