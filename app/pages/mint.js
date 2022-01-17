import { 
  ArweaveUploader, 
  Minter, 
  Wallet, 
  NftFetcher 
} from '../components';

const MintPage = () => {
  return (
    <Wallet>
      <NftFetcher />
      <Minter />
      <ArweaveUploader />
    </Wallet>
  )
}

export default MintPage;