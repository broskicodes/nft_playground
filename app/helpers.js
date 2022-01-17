import { Provider } from '@project-serum/anchor';

export const getProvider = (walletObj) => {
  if(!walletObj){
    return
  }
  const provider = new Provider(
    connection, walletObj, { preflightCommitment: "confirmed" },
  );
  return provider;
}