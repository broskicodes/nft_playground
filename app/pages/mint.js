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
      <ArweaveUploader 
        selectedNft={selectedNft}
      />
      <NftFetcher 
        selectedNft={selectedNft}
        setSelectedNft={setSelectedNft}
      />
    </Wallet>
  )
}

export default MintPage;