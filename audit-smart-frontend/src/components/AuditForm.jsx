import { useState, useEffect } from 'react';
import './AuditForm.css';
import UploadSection from './UploadSection';
import ResultsSection from './ResultsSection';
import { ethers } from 'ethers';
import {
  FeedbackIcon,
  FeedbackModal,
  useFeedbackSystem
} from './FeedbackSystem';

export default function AuditForm() {
  // Generate session-specific storage keys
  const [sessionId] = useState(() => {
    const id = localStorage.getItem('currentAuditSessionId') || Date.now().toString();
    localStorage.setItem('currentAuditSessionId', id);
    return id;
  });

  const getStorageKey = (key) => `auditSession_${sessionId}_${key}`;

  // File and code state
  const [file, setFile] = useState(null);
  const [pastedCode, setPastedCode] = useState(() => {
    return localStorage.getItem(getStorageKey('pastedCode')) || '';
  });

  // Processing states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [constructorInputs, setConstructorInputs] = useState([]);
  const [constructorArgs, setConstructorArgs] = useState({});
  const [showConstructorPrompt, setShowConstructorPrompt] = useState(false);
  const [cachedCompilation, setCachedCompilation] = useState(null);

  // Results states
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('results'));
    return saved ? JSON.parse(saved) : null;
  });
  const [compilationResults, setCompilationResults] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('compilationResults'));
    return saved ? JSON.parse(saved) : null;
  });
  const [deploymentResults, setDeploymentResults] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('deploymentResults'));
    return saved ? JSON.parse(saved) : null;
  });
  const [mintingResults, setMintingResults] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('mintingResults'));
    return saved ? JSON.parse(saved) : null;
  });

  // Error and wallet states
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletCheckComplete, setWalletCheckComplete] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const WHITELISTED_WALLETS = [
    "0xb97fcdcd02fe2b50d8014b80080c904845e027f1",
    "0x857b213598ed77fb4e862fc4355c13c472b94078",
    "0xc1e43b61445cd96e096554a637ac2a43451ebce2",
    "0x6e7bd4a9c0b4695dd21bd7557a6c55ae4676cb1c"
  ];

  // Deployment prompts
  const [showDeploymentPrompt, setShowDeploymentPrompt] = useState(false);
  const [showMintingPrompt, setShowMintingPrompt] = useState(false);
  const [deploymentAvailable, setDeploymentAvailable] = useState(() => {
    return localStorage.getItem(getStorageKey('deploymentAvailable')) === 'true';
  });
  const [mintingAvailable, setMintingAvailable] = useState(() => {
    return localStorage.getItem(getStorageKey('mintingAvailable')) === 'true';
  });

  // Feedback system
  const {
    showFeedback,
    setShowFeedback,
    closeFeedback,
    feedback,
    setFeedback,
    handleFeedbackSubmit,
    promptForFeedback,
    hasNewResults,
    pendingAuditId,
    isSubmitting
  } = useFeedbackSystem();

  // Persist all state to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey('pastedCode'), pastedCode);
  }, [pastedCode, sessionId]);

  useEffect(() => {
    if (results) {
      localStorage.setItem(getStorageKey('results'), JSON.stringify(results));
    } else {
      localStorage.removeItem(getStorageKey('results'));
    }
  }, [results, sessionId]);

  useEffect(() => {
    if (compilationResults) {
      localStorage.setItem(getStorageKey('compilationResults'), JSON.stringify(compilationResults));
    } else {
      localStorage.removeItem(getStorageKey('compilationResults'));
    }
  }, [compilationResults, sessionId]);

  useEffect(() => {
    if (deploymentResults) {
      localStorage.setItem(getStorageKey('deploymentResults'), JSON.stringify(deploymentResults));
    } else {
      localStorage.removeItem(getStorageKey('deploymentResults'));
    }
  }, [deploymentResults, sessionId]);

  useEffect(() => {
    if (mintingResults) {
      localStorage.setItem(getStorageKey('mintingResults'), JSON.stringify(mintingResults));
    } else {
      localStorage.removeItem(getStorageKey('mintingResults'));
    }
  }, [mintingResults, sessionId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('deploymentAvailable'), deploymentAvailable.toString());
  }, [deploymentAvailable, sessionId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('mintingAvailable'), mintingAvailable.toString());
  }, [mintingAvailable, sessionId]);
  useEffect(() => {
    if (!walletAddress || constructorInputs.length === 0) return;

    const updatedArgs = {};
    constructorInputs.forEach((input, index) => {
      const paramName = input.name && input.name.length > 0 ? input.name : `param${index}`;
      if (input.type === 'address') {
        updatedArgs[paramName] = walletAddress;
      }
    });

    setConstructorArgs(prev => ({
      ...updatedArgs,
      ...prev
    }));
  }, [walletAddress, constructorInputs]);

  // Sync state between tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key.startsWith(`auditSession_${sessionId}_`)) {
        const key = e.key.replace(`auditSession_${sessionId}_`, '');
        try {
          const value = e.newValue ? JSON.parse(e.newValue) : null;
          switch (key) {
            case 'pastedCode':
              setPastedCode(value || '');
              break;
            case 'results':
              setResults(value);
              break;
            case 'compilationResults':
              setCompilationResults(value);
              break;
            case 'deploymentResults':
              setDeploymentResults(value);
              break;
            case 'mintingResults':
              setMintingResults(value);
              break;
            case 'deploymentAvailable':
              setDeploymentAvailable(value === 'true');
              break;
            case 'mintingAvailable':
              setMintingAvailable(value === 'true');
              break;
          }
        } catch (err) {
          console.error('Error parsing storage update:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sessionId]);

  // Warn before leaving with unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasImportantData = results || compilationResults || deploymentResults || mintingResults;
      const hasOperationInProgress = isAnalyzing || isCompiling || isDeploying || isMinting;

      if (hasImportantData || hasOperationInProgress) {
        e.preventDefault();
        e.returnValue = 'You have unsaved audit results or operations in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAnalyzing, isCompiling, isDeploying, isMinting, results, compilationResults, deploymentResults, mintingResults]);

  // Wallet connection logic
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        } finally {
          setWalletCheckComplete(true);
        }
      } else {
        setWalletCheckComplete(true);
      }
    };

    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => { });
      }
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setShowWalletPrompt(false);
      } catch (err) {
        console.error('Wallet connection error:', err);
        setError('Failed to connect wallet. Please try again.');
      }
    } else {
      setError('MetaMask not detected. Please install MetaMask.');
    }
  };

  const clearAuditData = () => {
    setFile(null);
    setPastedCode('');
    setResults(null);
    setCompilationResults(null);
    setDeploymentResults(null);
    setMintingResults(null);
    setError(null);
    setShowDeploymentPrompt(false);
    setShowMintingPrompt(false);
    setDeploymentAvailable(false);
    setMintingAvailable(false);

    // Clear all session-specific storage
    localStorage.removeItem(getStorageKey('pastedCode'));
    localStorage.removeItem(getStorageKey('results'));
    localStorage.removeItem(getStorageKey('compilationResults'));
    localStorage.removeItem(getStorageKey('deploymentResults'));
    localStorage.removeItem(getStorageKey('mintingResults'));
    localStorage.removeItem(getStorageKey('deploymentAvailable'));
    localStorage.removeItem(getStorageKey('mintingAvailable'));
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!file && !pastedCode) return;

    setIsAnalyzing(true);
    setError(null);
    clearAuditData(); // Clear previous data before new audit

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (pastedCode) {
        const blob = new Blob([pastedCode], { type: 'text/plain' });
        formData.append('file', blob, 'pasted_contract.sol');
      }

      const response = await fetch('https://auditsmartai-mvp.onrender.com/api/v1/audit-only', {
        method: 'POST',
        body: formData,
        headers: {
          'wallet-address': walletAddress || 'no-wallet-connected'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Audit failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
      promptForFeedback(walletAddress || 'no-wallet-connected');

      if (data.fixed_code) {
        setShowDeploymentPrompt(true);
        setDeploymentAvailable(true);
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const compileContract = async (sourceCode) => {
    setIsCompiling(true);
    setError(null);

    try {
      const formData = new FormData();
      const blob = new Blob([sourceCode], { type: 'text/plain' });
      formData.append('file', blob, 'fixed_contract.sol');

      const response = await fetch('https://auditsmartai-mvp.onrender.com/api/v1/compile-only', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Compilation failed: ${response.statusText}`);
      }

      const compilationData = await response.json();
      setCompilationResults(compilationData);
      const constructorInputs = compilationData.abi.find(item => item.type === 'constructor')?.inputs || [];
      return { ...compilationData, constructorInputs };

    } catch (err) {
      console.error('Compilation error:', err);
      setError(`Compilation failed: ${err.message}`);
      throw err;
    } finally {
      setIsCompiling(false);
    }
  };
  const deployWithArgs = async (compilation, argsArray) => {
    setIsDeploying(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractFactory = new ethers.ContractFactory(
        compilation.abi,
        compilation.bytecode,
        signer
      );

      const contract = await contractFactory.deploy(...argsArray);
      const deployed = await contract.waitForDeployment();
      const address = await deployed.getAddress();
      const txReceipt = await deployed.deploymentTransaction().wait();

      const deploymentData = {
        status: 'success',
        contract_address: address,
        transaction_hash: txReceipt.hash,
        block_number: txReceipt.blockNumber,
        gas_used: txReceipt.gasUsed.toString(),
        contract_name: results.contract_name || compilation.contract_name,
        network: (await provider.getNetwork()).name,
        chain_id: (await provider.getNetwork()).chainId.toString(),
        deployed_by: walletAddress,
        deployment_timestamp: new Date().toISOString()
      };

      setDeploymentResults(deploymentData);
      setDeploymentAvailable(false);
      setShowMintingPrompt(true);
      setMintingAvailable(true);
    } catch (err) {
      setError(err.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeploy = async () => {
    if (!walletAddress) {
      setShowWalletPrompt(true);
      return;
    }

    if (!results || !results.fixed_code) {
      setError('No fixed code available for deployment');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setShowDeploymentPrompt(false);

    try {
      const compilation = await compileContract(results.fixed_code);
      setCachedCompilation(compilation);

      if (compilation.constructorInputs.length > 0) {
        setConstructorInputs(compilation.constructorInputs);
        setShowConstructorPrompt(true); // Show form to enter args
        return; // Wait for user input
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractFactory = new ethers.ContractFactory(
        compilation.abi,
        compilation.bytecode,
        signer
      );

      const deployTx = await contractFactory.deploy();
      const deploymentReceipt = await deployTx.waitForDeployment();
      const contractAddress = await deploymentReceipt.getAddress();
      const deploymentTxReceipt = await deploymentReceipt.deploymentTransaction().wait();

      const deploymentData = {
        status: 'success',
        contract_address: contractAddress,
        transaction_hash: deploymentTxReceipt.hash,
        block_number: deploymentTxReceipt.blockNumber,
        gas_used: deploymentTxReceipt.gasUsed.toString(),
        contract_name: results.contract_name || compilation.contract_name,
        network: (await provider.getNetwork()).name,
        chain_id: (await provider.getNetwork()).chainId.toString(),
        deployed_by: walletAddress,
        deployment_timestamp: new Date().toISOString()
      };

      setDeploymentResults(deploymentData);
      setDeploymentAvailable(false);
      setShowMintingPrompt(true);
      setMintingAvailable(true);

    } catch (err) {
      console.error('Deployment error:', err);
      setError(err.message || "An unknown error occurred during deployment");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleMintNFT = async () => {
    if (!walletAddress) {
      setShowWalletPrompt(true);
      return;
    }

    if (!deploymentResults || !deploymentResults.contract_address) {
      setError('No deployment data available for minting');
      return;
    }

    setIsMinting(true);
    setError(null);
    setShowMintingPrompt(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const ipfsImageCIDs = [
        "bafybeihre5jk4porbizbyhdb3cmhyci6xhs3horz4dxigk2tzdetixdlcu",
        "bafybeih4kxtwt2adymhf2cdmcpdcqamllgnenvnngviw4f2f6c4wcrtjqu",
        "bafybeid4emz6qjcgogo6woj2jwhyr2nfp5d5guzsxxfk2ihhxzcvtvdsn4",
        "bafybeidm3u4nt33vdszppgei7h5qbdlgra7bjfe273svvdlhs3oo6z7nii"
      ];

      const randomCID = ipfsImageCIDs[Math.floor(Math.random() * ipfsImageCIDs.length)];
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${randomCID}`;

      const unixTimestamp = Math.floor(Date.now() / 1000);
      const readableDate = new Date(unixTimestamp * 1000).toISOString().split('T')[0];
      const readableTime = new Date(unixTimestamp * 1000).toISOString().split('T')[1].split('.')[0];

      const metadata = {
        name: `AuditSmart NFT - ${deploymentResults.contract_name}`,
        description: `AuditSmart NFT for ${deploymentResults.contract_name} deployed at ${deploymentResults.contract_address}`,
        image: imageUrl,
        contract_address: deploymentResults.contract_address,
        transaction_hash: deploymentResults.transaction_hash,
        deployed_by: walletAddress,
        network: "L1X",
        chain_id: deploymentResults.chain_id,
        deployment_time: unixTimestamp,
        attributes: [
          { trait_type: "Contract Address", value: deploymentResults.contract_address },
          { trait_type: "Deployed By", value: walletAddress },
          { trait_type: "Network", value: "L1X" },
          { trait_type: "Chain ID", value: deploymentResults.chain_id },
          { trait_type: "Deployment Date", value: readableDate },
          { trait_type: "Deployment Time", value: unixTimestamp },
          { trait_type: "Unix Timestamp", value: unixTimestamp }
        ]
      };

      const metadataResponse = await fetch('https://auditsmartai-mvp.onrender.com/api/v1/pin-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        },
        body: JSON.stringify(metadata),
      });

      const contentType = metadataResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await metadataResponse.text();
        throw new Error(`Server returned non-JSON response. Content-Type: ${contentType}. Response: ${responseText.substring(0, 200)}...`);
      }

      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        throw new Error(`Failed to pin metadata to IPFS. Status: ${metadataResponse.status}. Error: ${errorText}`);
      }

      const metadataResult = await metadataResponse.json();
      const tokenUri = metadataResult.ipfs_uri;
      if (!tokenUri) {
        throw new Error('No IPFS URI returned from metadata pinning service');
      }

      const configResponse = await fetch('https://auditsmartai-mvp.onrender.com/api/v1/nft-config', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        }
      });

      const configContentType = configResponse.headers.get('content-type');
      if (!configContentType || !configContentType.includes('application/json')) {
        const configResponseText = await configResponse.text();
        throw new Error(`NFT config server returned non-JSON response. Content-Type: ${configContentType}. Response: ${configResponseText.substring(0, 200)}...`);
      }

      if (!configResponse.ok) {
        const configErrorText = await configResponse.text();
        throw new Error(`Failed to get NFT contract configuration. Status: ${configResponse.status}. Error: ${configErrorText}`);
      }

      const { nft_contract_address, nft_abi } = await configResponse.json();
      if (!nft_contract_address || !nft_abi) {
        throw new Error('Invalid NFT contract configuration received');
      }

      const nftContract = new ethers.Contract(nft_contract_address, nft_abi, signer);
      const gasEstimate = await nftContract.mintToUser.estimateGas(walletAddress, tokenUri);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const tx = await nftContract.mintToUser(walletAddress, tokenUri, { gasLimit });
      const receipt = await tx.wait();

      const transferEvent = receipt.logs
        .map(log => {
          try {
            return nftContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === "Transfer");

      const tokenId = transferEvent ? transferEvent.args.tokenId.toString() : 'N/A';

      const mintingData = {
        status: 'success',
        transaction_hash: receipt.hash,
        block_number: receipt.blockNumber,
        gas_used: receipt.gasUsed.toString(),
        nft_contract: nft_contract_address,
        recipient: walletAddress,
        token_uri: tokenUri,
        metadata: metadata,
        token_id: tokenId
      };

      setMintingResults(mintingData);
      setMintingAvailable(false);

    } catch (err) {
      console.error('Detailed NFT minting error:', err);
      let errorMessage = 'An unknown error occurred during NFT minting';
      if (err.message.includes('Unexpected token')) {
        errorMessage = 'Server returned invalid response. Please check if the backend service is running properly.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.message.includes('non-JSON response')) {
        errorMessage = 'Server configuration error: The backend is not responding with proper JSON data.';
      } else {
        errorMessage = err.message;
      }
      setError(`NFT Minting failed: ${errorMessage}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleDeployLater = () => {
    setShowDeploymentPrompt(false);
  };

  const handleMintLater = () => {
    setShowMintingPrompt(false);
  };

  return (
    <>
      <div className="audit-dashboard">
        <div className="dashboard-headers">
          <h1>
            <span className="gradient-text">AI-Powered</span>
            <span className="gradient-text-accent">Smart Contract Audits</span>
          </h1>
          <p className="subtitle">
            Uncover hidden vulnerabilities and optimize your Solidity code with blazing-fast, enterprise-grade security intelligence.
          </p>
        </div>

        <div className="vertical-layout">


          <UploadSection
            file={file}
            setFile={setFile}
            pastedCode={pastedCode}
            setPastedCode={setPastedCode}
            isAnalyzing={isAnalyzing}
            error={error}
            setError={setError}
            walletAddress={walletAddress}
            handleSubmit={handleAuditSubmit}
            showWalletPrompt={showWalletPrompt}
            setShowWalletPrompt={setShowWalletPrompt}
            connectWallet={connectWallet}
            submitButtonText={results ? "Re-run Security Audit" : "Start Security Audit"}
          />
          {results && (
            <button
              onClick={clearAuditData}
              className="reset-audit-btn"
              disabled={isAnalyzing || isCompiling || isDeploying || isMinting}
            >
              <svg className="refresh-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
              </svg>
              Refresh
            </button>
          )}

          {showDeploymentPrompt && (
            <div className="deployment-prompt">
              <div className="prompt-content">
                <h3>🚀 Ready to Deploy?</h3>
                <p>
                  Your contract has been analyzed and fixed! The deployment will be handled by your MetaMask wallet on your selected network.
                </p>
                <div className="prompt-actions">
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || isCompiling}
                    className="deploy-btn primary"
                  >
                    {isCompiling ? 'Compiling...' : isDeploying ? 'Deploying...' : 'Yes, Deploy Contract'}
                  </button>
                  <button
                    onClick={handleDeployLater}
                    disabled={isDeploying || isCompiling}
                    className="deploy-btn secondary"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}
          {showConstructorPrompt && (
            <div className="deployment-prompt">
              <div className="prompt-content">
                <h3>🔧 Constructor Arguments Required</h3>
                <p>This contract needs parameters for deployment. Please enter them:</p>
                {constructorInputs.map((input, index) => {
                  const paramName = input.name && input.name.length > 0 ? input.name : `param${index}`;
                  const isAddress = input.type === 'address';

                  return (
                    <div className="constructor-input-container" key={index}>
                      <label className="constructor-input-label">
                        {paramName} <span style={{ color: "#666" }}>({input.type})</span>
                      </label>
                      <input
                        className="constructor-input-field"
                        type="text"
                        placeholder={isAddress ? 'e.g. 0xabc123...' : `Enter ${paramName}`}
                        value={constructorArgs[paramName] || ''}
                        readOnly={isAddress}
                        onChange={(e) =>
                          setConstructorArgs(prev => ({
                            ...prev,
                            [paramName]: e.target.value
                          }))
                        }
                      />
                    </div>
                  );
                })}



                <div className="prompt-actions">
                  <button
                    className="deploy-btn primary"
                    onClick={() => {
                      setShowConstructorPrompt(false);
                      const argsArray = constructorInputs.map((input, index) => constructorArgs[input.name || `param${index}`]);
                      deployWithArgs(cachedCompilation, argsArray);
                    }}
                  >
                    Deploy with Parameters
                  </button>
                  <button
                    className="deploy-btn secondary"
                    onClick={() => setShowConstructorPrompt(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showMintingPrompt && (
            <div className="deployment-prompt">
              <div className="prompt-content">
                <h3>🎉 Ready to Mint NFT?</h3>
                <p>
                  Your contract has been successfully deployed! Would you like to mint your Security Audit NFT as proof of the audit and deployment?
                </p>
                <div className="prompt-actions">
                  <button
                    onClick={handleMintNFT}
                    disabled={isMinting}
                    className="deploy-btn primary"
                  >
                    {isMinting ? 'Minting...' : 'Yes, Mint Audit NFT'}
                  </button>
                  <button
                    onClick={handleMintLater}
                    disabled={isMinting}
                    className="deploy-btn secondary"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {results && (
            <ResultsSection
              results={results}
              compilationResults={compilationResults}
              deploymentResults={deploymentResults}
              mintingResults={mintingResults}
              onDeployRequest={handleDeploy}
              onMintRequest={handleMintNFT}
              showDeployButton={deploymentAvailable && !deploymentResults}
              showMintButton={mintingAvailable && !mintingResults}
              isCompiling={isCompiling}
              isDeploying={isDeploying}
              isMinting={isMinting}
              walletAddress={walletAddress}
              onWalletConnect={() => setShowWalletPrompt(true)}
            />
          )}
        </div>
      </div>

      {results && <FeedbackIcon
        onClick={setShowFeedback}
        hasNewResults={hasNewResults}
      />}

      <FeedbackModal
        show={showFeedback}
        onClose={closeFeedback}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmit={handleFeedbackSubmit}
        deploymentResults={deploymentResults}
        mintingResults={mintingResults}
        walletAddress={walletAddress}
        isSubmitting={isSubmitting}
      />
    </>
  );
}