const fs = require("fs");
const Arweave = require("arweave");

(async () => {
  const arweave = Arweave.init({
    host: "127.0.0.1",
    port: 3000,
    protocol: "http"
  });

  const key = await arweave.wallets.generate();

  fs.writeFileSync("../app/keypairs/arKeypair.json", JSON.stringify(key));
})()