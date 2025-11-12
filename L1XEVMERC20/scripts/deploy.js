const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with wallet:", deployer.address);

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");

  // Pass deployer address to constructor
  const contract = await MyNFT.deploy(deployer.address);

  // No need to wait again; deploy() resolves when deployed

  console.log("NFT Contract deployed at:", contract.target ?? contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
