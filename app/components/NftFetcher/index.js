import { getProvider } from '../../helpers';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Idl, Program, Provider, web3, BN } from '@project-serum/anchor';
import { Keypair, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import { Nft } from "../Nft";

export const NftFetcher = ({ setSelectedNft, selectedNft }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const walletObj = useAnchorWallet();
  const [nftMetadata, setNftMetadata] = useState([]);
  const [nftImgSrc, setNftImgSrc] = useState([]);

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
    
    const mtdt = await verifyNfts(nfts);
    console.log(mtdt);

    let imgsSrc = await getImgBlobs(mtdt);
    // setNftMetadata(src);
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
        acc.metadata = metadata;
        return acc;
      } catch(e) {
        return null;
      }
    });

    possibleNfts = await Promise.all(promises);

    let nfts = possibleNfts.filter((item) => item);
    console.log(nfts);

    return nfts;
  }

  const getImgBlobs = async (mtdt) => {
    let promises = mtdt.map(async (acc) => {
      const res = await fetch(acc.metadata.data.data.uri);
      const json = await res.json();

      const imgRes = await fetch(json.image);
      const imgBlob = await imgRes.blob();
      // console.log(imgBlob);

      const imgSrc = URL.createObjectURL(imgBlob);

      // console.log(imgSrc)
      acc.src = imgSrc;

      return acc;
    });

    const imgs = await Promise.all(promises);

    setNftMetadata(imgs);
  }  

  // useEffect(() => {
  //   const onLoad = async () => {
  //     await getNfts();
  //   };
  //   window.addEventListener('load', onLoad);
  //   return () => window.removeEventListener('load', onLoad);
  // }
  // , []);

  return (
    <div>
      {!!publicKey && 
        <button onClick={getNfts} className="bg-slate-400 rounded px-2 active:bg-slate-600 hover:bg-slate-500">
          Get Nfts
        </button>  
      }
      {nftMetadata.length > 0 && 
        <div className="flex">
          {nftMetadata.map((mtdt, i) => (
            <Nft 
              key={i}
              metadata={mtdt}
              setSelectedNft={setSelectedNft}
              selected={selectedNft && selectedNft.mint === mtdt.mint}
            />
          ))}
        </div>  
      }
    </div>
  )
}