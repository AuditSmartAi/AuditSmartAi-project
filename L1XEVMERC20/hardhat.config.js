require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0", // Optional: keep if needed
      },
      {
        version: "0.8.20", // Required for newer OpenZeppelin contracts
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    l1xTestnet: {
      url: "https://v2-mainnet-rpc.l1x.foundation/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  }, // ✅ Added comma here
};
