import React, { useState, useEffect } from 'react';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import Arweave from "arweave";
import arKP from "../../keypairs/arKeypair.json";
import fileToArrayBuffer from "file-to-array-buffer";
import { Minter } from "../";

const arweave = Arweave.init({});

export const ArweaveUploader = ({ selectedNft }) => {
  const { publicKey } = useWallet();
  const [content, setContent] = useState(undefined);
  const [attributes, setAttributes] = useState(
    {
      name: '',
      symbol: '',
      image: '',
      description: '',
      // externalUrl: '',
      // animationUrl: undefined,
      // attributes: undefined,
      sellerFeeBasisPoints: 0,
      creators: [],
      collection: '',
      properties: {
        files: [],
        category: '',
      },
    }
  );

  const setFile = (event) => {
    const files = event.target.files;

    if(files){
      const file = files[0];
      console.log("success");
      setContent(file);
      return;
    }

    console.log("No files chosen");
  }

  const uploadMetadata = async () => {
    try {
      let tx1 = await arweave.createTransaction({
        data: JSON.stringify(attributes),
      }, arKP);
      tx1.addTag("Content-Type", "text/plain");
      
      await arweave.transactions.sign(tx1, arKP);

      let uploader = await arweave.transactions.getUploader(tx1);

      while(!uploader.isComplete){
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }

      console.log(tx1);

      let res = await arweave.transactions.getStatus(tx1.id);
      console.log(res);

      return "https://arweave.net/" + tx1.id;
    } catch(e){
      console.log(e);
    }
  }

  const uploadFile = async () => {
    if(!content || !publicKey) {
      console.log("No content to upload or missing pubkey");
      return null;
    }

    let address = await arweave.wallets.jwkToAddress(arKP);
    console.log(address);

    arweave.wallets.getBalance(address).then((bal) => {
      console.log(arweave.ar.winstonToAr(bal));
    });

    try {
      const data = await fileToArrayBuffer(content);

      let tx = await arweave.createTransaction({
        data: data
      }, arKP);
      tx.addTag("Content-Type", content.type);
      
      await arweave.transactions.sign(tx, arKP);

      let uploader = await arweave.transactions.getUploader(tx);

      while(!uploader.isComplete){
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }

      console.log(tx);

      let res = await arweave.transactions.getStatus(tx.id);
      console.log(res);

      const uploadLink = "https://arweave.net/" + tx.id + "?ext=" + content.type.split('/')[1];
      setAttributes((prevState) => {
        prevState.image =  uploadLink;
        prevState.creators = [{
          address: publicKey.toString(),
          verified: true,
          share: 100,
        }];

        const newProps = {
          ...prevState.properties,
          files: [{
            uri: uploadLink,
            type: content.type,
          }],
          category: content.type.split('/')[0],
        }
        prevState.properties = newProps;

        return prevState;
      });
      
    } catch(e) {
      console.log(e);
    }
  }

  const setAttribute = (event) => {
    console.log(attributes);
    const { target, } = event;
    setAttributes((prevState) => {
      prevState[target.id] = target.id !== 'sellFeeBasisPoints' ? target.value : Number(target.value);

      return prevState;
    });
  }

  return (
    <div>
      <input id="name" type="text" placeholder="Name" onChange={setAttribute} />
      <input id="symbol" type="text" placeholder="Symbol" onChange={setAttribute} />
      <input id="description" type="text" placeholder="Desrciption" onChange={setAttribute} />
      <input id="sellerFeeBasisPoints" type="text" placeholder="Seller Fee Basis Points" onChange={setAttribute} />
      <input id="collection" type="text" placeholder="Collection" onChange={setAttribute} />
      <br />
      <label htmlFor="content">File: </label>
      <input id="content" type="file" onChange={setFile} />
      {/* <button onClick={uploadFile}>Upload</button>
      <button onClick={uploadMetadata}>Data</button> */}
      <Minter 
        selectedNft={selectedNft}
        uploadFile={uploadFile}
        uploadMetadata={uploadMetadata}
        attributes={attributes}
      />
    </div>
  )
}