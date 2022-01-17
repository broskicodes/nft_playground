import { useState } from 'react';
import { 
  ArweaveUploader, 
  Minter, 
  Wallet, 
  NftFetcher 
} from '../components';

const MintPage = () => {
  const [selectedNft, setSelectedNft] = useState(null);

  return (
    <Wallet>
      <NftFetcher 
        selectedNft={selectedNft}
        setSelectedNft={setSelectedNft}
      />
      <Minter 
        selectedNft={selectedNft}
      />
      <ArweaveUploader />
    </Wallet>
  )
}

export default MintPage;