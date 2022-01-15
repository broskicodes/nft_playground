const anchor = require('@project-serum/anchor');
const { assert } = require('chai');

const { PublicKey } = anchor.web3;

const { 
  createMint, 
  createTokenAccount,
  getTokenAccount,
  TokenInstructions,
  airDropSol,
} = require("../helpers/token");

describe('nft', () => {

  // Configure the client to use the local cluster.

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NftPlayground;

  let mint = null;
  let to = null;
  // let metadata = anchor.web3.Keypair.generate();
  let baseAccount = anchor.web3.Keypair.generate();
  // let rent = anchor.web3.Keypair.generate();
  let tokenMetadataProgram = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  let metadata = null;
  let masterEdition = null;
  let bump = null;

  it('inits', async () => {

    await airDropSol(baseAccount, 0.5);

    let enc = new TextEncoder();
    mint = await createMint(provider, baseAccount.publicKey);
    to = await createTokenAccount(provider, mint, provider.wallet.publicKey);

    [metadata, bump] = await PublicKey.findProgramAddress(
      [
        enc.encode('metadata'),
        tokenMetadataProgram.toBytes(),
        mint.toBytes()
      ],
      tokenMetadataProgram
    );
    [masterEdition, bump] = await PublicKey.findProgramAddress(
      [
        enc.encode('metadata'),
        tokenMetadataProgram.toBytes(),
        mint.toBytes(),
        enc.encode('edition'),
      ],
      tokenMetadataProgram
    );
  });

  it('Mints one!', async () => {
    const tx = await program.rpc.proxyMintTo(new anchor.BN(1), {
      accounts: {
        authority: baseAccount.publicKey,
        mint: mint,
        to: to,
        tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
      },
      signers: [baseAccount]
    });

    const tokAcnt = await getTokenAccount(provider, to);

    assert.ok(tokAcnt.amount.eq(new anchor.BN(1)));
  });

  it('Mints nft!', async () => {
    const tx = await program.rpc.proxyMintNft(
      "name",
      "",
      "uri",
      0,
      false,
      false,
      null,
      {
        accounts: {
          tokenMetadataProgram,
          metadata,
          mint,
          edition: masterEdition,
          mintAuthority: baseAccount.publicKey,
          payer: baseAccount.publicKey,
          updateAuthority: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [baseAccount]
      },
    );
    // console.log("Your transaction signature", tx);
    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"), "confirmed");
    connection.getAccountInfo(metadata)
      .then(ai => assert.equal(ai.owner, tokenMetadataProgram));

    connection.getAccountInfo(masterEdition)
      .then(ai => assert.eq(ai.owner, tokenMetadataProgram));
  });
});