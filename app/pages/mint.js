import { ArweaveUploader, Minter, Wallet } from '../components';

const MintPage = () => {
  return (
    <Wallet>
      <Minter />
      <ArweaveUploader />
    </Wallet>
  )
}

export default MintPage;