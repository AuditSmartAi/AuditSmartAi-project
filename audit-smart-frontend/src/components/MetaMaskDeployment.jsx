import { useState } from 'react';
import { ethers } from 'ethers';

const MetaMaskDeployment = ({
  contractData,
  walletAddress,
  onDeploymentSuccess,
  onDeploymentError
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);


  const deployContract = async (abi, bytecode) => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(); // Add constructor args if needed
    await contract.deployed();

    return {
      contractAddress: contract.address,
      txHash: contract.deployTransaction.hash
    };
  };

  const mintNFT = async (nftAbi, nftContractAddress, tokenURI, recipient) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftContractAddress, nftAbi, signer);
    const tx = await nftContract.mintToUser(recipient, tokenURI);
    const receipt = await tx.wait();

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  };


  const getNetworkName = async () => {
    if (!window.ethereum) return 'Unknown';

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      return network.name || `Chain ID: ${network.chainId}`;
    } catch {
      return 'Unknown';
    }
  };

  const [networkName, setNetworkName] = useState('');

  // Get network name on component mount
  useState(() => {
    getNetworkName().then(setNetworkName);
  }, []);

  if (!contractData) {
    return (
      <div className="metamask-deployment">
        <p>No contract data available for deployment</p>
      </div>
    );
  }

  return (
    <div className="metamask-deployment">
      <div className="deployment-info">
        <h3>🦊 Deploy with MetaMask</h3>
        <div className="contract-details">
          <p><strong>Contract:</strong> {contractData.contract_name}</p>
          <p><strong>Network:</strong> {networkName}</p>
          <p><strong>Wallet:</strong> {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</p>
          <p><strong>Security Score:</strong> {
            contractData.security_analysis?.security_score
              ? `${Math.round(contractData.security_analysis.security_score * 100)}%`
              : 'N/A'
          }</p>
        </div>

        {contractData.security_analysis?.warnings?.length > 0 && (
          <div className="security-warnings">
            <h4>⚠️ Security Warnings:</h4>
            <ul>
              {contractData.security_analysis.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {contractData.security_analysis?.critical_issues?.length > 0 && (
          <div className="critical-issues">
            <h4>🚨 Critical Issues:</h4>
            <ul>
              {contractData.security_analysis.critical_issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
            <p className="warning-text">
              ⚠️ This contract has critical security issues. Deployment is not recommended.
            </p>
          </div>
        )}
      </div>

      <div className="deployment-actions">
        <button
          onClick={deployContract}
          disabled={isDeploying || contractData.security_analysis?.critical_issues?.length > 0}
          className={`deploy-button ${isDeploying ? 'deploying' : ''} ${contractData.security_analysis?.critical_issues?.length > 0 ? 'disabled' : ''
            }`}
        >
          {isDeploying ? (
            <>
              <span className="spinner"></span>
              {deploymentStatus}
            </>
          ) : (
            'Deploy Contract with MetaMask'
          )}
        </button>
      </div>

      <style jsx>{`
        .metamask-deployment {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
          color: white;
        }

        .deployment-info h3 {
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .contract-details {
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .contract-details p {
          margin: 8px 0;
          display: flex;
          justify-content: space-between;
        }

        .security-warnings, .critical-issues {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.5);
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .critical-issues {
          background: rgba(220, 53, 69, 0.2);
          border-color: rgba(220, 53, 69, 0.5);
        }

        .security-warnings ul, .critical-issues ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        .warning-text {
          color: #ffc107;
          font-weight: bold;
          margin-top: 12px;
        }

        .deploy-button {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 56px;
          width: 100%;
          justify-content: center;
        }

        .deploy-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
        }

        .deploy-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .deploy-button.disabled {
          background: #dc3545;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .deployment-actions {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default MetaMaskDeployment;