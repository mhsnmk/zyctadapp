require("@matterlabs/hardhat-zksync-verify");
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  zksolc: {
    version: "1.3.8",
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    zkSyncTestnet: {
       url: "https://testnet.era.zksync.dev/",
       ethNetwork: "goerli", // Can also be the RPC URL of the network (e.g. https://goerli.infura.io/v3/<API_KEY>)
       zksync: true,
        gas: "auto",
        verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'

    },
     zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io/",
      ethNetwork: "mainnet",
      zksync: true,
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
    },

  },
  solidity: {
    version: "0.8.9",
  },
};
