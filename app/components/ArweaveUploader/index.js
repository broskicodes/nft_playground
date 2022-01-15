import React, { useState, useEffect } from 'react';
import Arweave from "arweave";
import arKP from "../../keypairs/arKeypair.json";
import fileToArrayBuffer from "file-to-array-buffer";

const arweave = Arweave.init({});

export const ArweaveUploader = () => {
  const [content, setContent] = useState(undefined);

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

  const uploadData = async () => {
    try {
      const data = {
        name: 'Code Monkey Dao Membership NFT',
        symbol: '',
        image: 'https://arweave.net/ot0DK-GBwmY2rTtDhy538ldWcCfh8tnkVhgeGX0U52o?ext=png',
        description: 'Code Monkey Dao Membership NFT',
        external_url: '',
        // uri: '',
        animation_url: undefined,
        attributes: undefined,
        sellerFeeBasisPoints: 0,
        // creators: [],
        collection: undefined,
        properties: {
          files: [
            {
              uri: 'https://arweave.net/ot0DK-GBwmY2rTtDhy538ldWcCfh8tnkVhgeGX0U52o?ext=png',
              type: 'image/png'
            }
          ],
          category: "image",
        },
      }

      let tx1 = await arweave.createTransaction({
        data: JSON.stringify(data),
      }, arKP);
      tx1.addTag("Content-Type", "text/plain");
      
      await arweave.transactions.sign(tx1, arKP);

      let uploader = await arweave.transactions.getUploader(tx1);

      while(!uploader.isComplete){
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }

      console.log(tx1);

      arweave.transactions.getStatus(tx1.id).then(res => {
        console.log(res);
      });
    } catch(e){
      console.log(e);
    }
  }

  const uploadToArweave = async () => {
    if(!content) {
      console.log("No content to upload");
      return null;
    }

    let address = await arweave.wallets.jwkToAddress(arKP);
    console.log(address);

    arweave.wallets.getBalance(address).then((bal) => {
      console.log(arweave.ar.winstonToAr(bal));
    });

    try {
      const data = await fileToArrayBuffer(content);

      let tx1 = await arweave.createTransaction({
        data: data
      }, arKP);
      tx1.addTag("Content-Type", content.type);
      
      await arweave.transactions.sign(tx1, arKP);

      let uploader = await arweave.transactions.getUploader(tx1);

      while(!uploader.isComplete){
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }

      console.log(tx1);

      arweave.transactions.getStatus(tx1.id).then(res => {
        console.log(res);
      });
      
    } catch(e) {
      console.log(e);
    }
  }

  return (
    <div>
      <label htmlFor="content">File: </label>
      <input id="content" type="file" onChange={setFile} />

      <button onClick={uploadToArweave}>Upload</button>
      <button onClick={uploadData}>Data</button>
    </div>
  )
}