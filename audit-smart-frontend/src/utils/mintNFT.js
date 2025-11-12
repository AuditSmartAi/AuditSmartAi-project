import { ethers } from "ethers";

async function mintNFT(nftContractAddress, nftAbi, tokenUri) {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const nftContract = new ethers.Contract(nftContractAddress, nftAbi, signer);

  const userAddress = await signer.getAddress();

  try {
    // Call your NFT contract mint method - adjust function name & params accordingly
    const tx = await nftContract.mintToUser(userAddress, tokenUri); // example: mintTo(address, tokenURI)
    console.log("Mint tx sent:", tx.hash);
    await tx.wait();
    alert(`NFT minted successfully! TxHash: ${tx.hash}`);
  } catch (err) {
    console.error("Minting failed:", err);
    alert("NFT minting failed: " + (err.message || err));
  }
}
