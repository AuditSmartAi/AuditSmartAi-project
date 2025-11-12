// src/components/ContractAuditAndDeploy.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function ContractAuditAndDeploy() {
  const [file, setFile] = useState(null);
  const [solidityCode, setSolidityCode] = useState("");
  const [auditResult, setAuditResult] = useState(null);
  const [fixedCode, setFixedCode] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [minting, setMinting] = useState(false);
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Connect MetaMask wallet
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      const sign = prov.getSigner();
      const addr = await sign.getAddress();
      setProvider(prov);
      setSigner(sign);
      setWalletAddress(addr);
      setMessage(`Wallet connected: ${addr}`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to connect wallet.");
    }
  }

  // Handle file upload
  function onFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSolidityCode(event.target.result);
    };
    reader.readAsText(f);
  }

  // Call backend audit API
  async function handleAudit() {
    if (!file && !solidityCode.trim()) {
      alert("Please upload or paste Solidity code.");
      return;
    }

    setMessage("Auditing contract...");
    setAuditResult(null);
    setFixedCode("");

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      // create blob from solidityCode for upload
      const blob = new Blob([solidityCode], { type: "text/plain" });
      formData.append("file", blob, "contract.sol");
    }

    try {
      const response = await fetch("http://localhost:8000/audit-only/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Audit failed");
      }
      const data = await response.json();
      setAuditResult(data);
      if (data.fixed_code) setFixedCode(data.fixed_code);
      setMessage("Audit completed.");
    } catch (err) {
      console.error(err);
      setMessage(`Audit error: ${err.message}`);
    }
  }

  // Deploy fixed contract using MetaMask signer
  async function deployWithMetaMask() {
    if (!fixedCode) {
      alert("No fixed code available to deploy.");
      return;
    }
    if (!signer) {
      alert("Please connect your wallet first.");
      return;
    }
    setDeploying(true);
    setMessage("Compiling and deploying contract...");

    try {
      // Use solc-js to compile contract in frontend
      const solc = await import("solc");

      // Prepare input JSON for solc compiler
      const input = {
        language: "Solidity",
        sources: {
          "Contract.sol": { content: fixedCode },
        },
        settings: {
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode"],
            },
          },
        },
      };

      // Compile
      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      if (output.errors) {
        const errors = output.errors.filter((e) => e.severity === "error");
        if (errors.length > 0) {
          setDeploying(false);
          return setMessage("Compilation errors: " + errors.map((e) => e.formattedMessage).join("\n"));
        }
      }

      // Assume first contract in output
      const contractName = Object.keys(output.contracts["Contract.sol"])[0];
      const contractData = output.contracts["Contract.sol"][contractName];

      const abi = contractData.abi;
      const bytecode = contractData.evm.bytecode.object;

      if (!bytecode || bytecode.length === 0) {
        setDeploying(false);
        return setMessage("Compiled bytecode is empty.");
      }

      // Deploy contract
      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      const contract = await factory.deploy();
      setMessage("Waiting for contract deployment...");
      await contract.deployed();

      setMessage(`Contract deployed at: ${contract.address}`);

      // Optionally save deployed address in state or call your backend with deployed info

      setDeploying(false);

      return contract.address;
    } catch (err) {
      console.error(err);
      setMessage("Deployment failed: " + err.message);
      setDeploying(false);
    }
  }

  // Mint NFT by calling backend mint endpoint using connected wallet address and token URI
  async function mintNFT(contractAddress) {
    if (!walletAddress) {
      alert("Connect wallet first.");
      return;
    }
    setMinting(true);
    setMessage("Minting NFT...");

    try {
      // Prepare form data with fixed contract file + wallet address
      const formData = new FormData();
      const blob = new Blob([fixedCode], { type: "text/plain" });
      formData.append("file", blob, "fixed_contract.sol");
      formData.append("wallet_address", walletAddress);

      const response = await fetch("http://localhost:8000/deploy-and-mint/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Minting failed");
      }
      const data = await response.json();

      setMessage(`NFT minted! Transaction info: ${JSON.stringify(data.nft_minting_result)}`);
    } catch (err) {
      console.error(err);
      setMessage("Minting error: " + err.message);
    } finally {
      setMinting(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>Audit, Deploy & Mint MFT with MetaMask</h2>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect MetaMask Wallet</button>
      ) : (
        <p>Connected wallet: {walletAddress}</p>
      )}

      <hr />

      <label>
        Upload Solidity Contract (.sol):
        <input type="file" accept=".sol" onChange={onFileChange} />
      </label>

      <p>Or paste Solidity code below:</p>
      <textarea
        rows={12}
        style={{ width: "100%" }}
        value={solidityCode}
        onChange={(e) => {
          setSolidityCode(e.target.value);
          setFile(null); // clear file if user pastes code
        }}
      />

      <button onClick={handleAudit} disabled={deploying || minting}>
        Audit Contract
      </button>

      {message && <p><b>Status:</b> {message}</p>}

      {auditResult && (
        <>
          <h3>Audit Results:</h3>
          <pre
            style={{
              background: "#f0f0f0",
              padding: 10,
              whiteSpace: "pre-wrap",
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {JSON.stringify(auditResult, null, 2)}
          </pre>
          {fixedCode && (
            <>
              <h3>Fixed Contract Code:</h3>
              <textarea
                rows={12}
                style={{ width: "100%" }}
                value={fixedCode}
                onChange={(e) => setFixedCode(e.target.value)}
              />
              <button
                onClick={async () => {
                  const addr = await deployWithMetaMask();
                  if (addr) {
                    // Optionally mint NFT after deployment
                    await mintNFT(addr);
                  }
                }}
                disabled={deploying || minting}
              >
                Deploy Fixed Contract & Mint NFT
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
