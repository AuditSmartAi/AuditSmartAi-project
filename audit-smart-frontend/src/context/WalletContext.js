// WalletContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsConnected(true);
            setChainId(currentChainId);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkWalletConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setWalletAddress(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
        window.location.reload(); // Recommended by MetaMask
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask.');
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      setChainId(currentChainId);
      
      return accounts[0];
    } catch (err) {
      console.error('Wallet connection error:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setChainId(null);
  };

  const deployContract = async (contractFile, forceDeployment = false) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    const formData = new FormData();
    formData.append('contract_file', contractFile);
    formData.append('wallet_address', walletAddress);
    formData.append('force_deploy', forceDeployment.toString());

    const response = await fetch('/api/deploy-contract', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for FormData
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Deployment failed');
    }

    return await response.json();
  };

  const mintNFT = async (contractAddress, recipientAddress, metadata, tokenUri = null) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    const response = await fetch('/api/mint-nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contract_address: contractAddress,
        recipient: recipientAddress,
        metadata: metadata,
        token_uri: tokenUri,
        wallet_address: walletAddress
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Minting failed');
    }

    return await response.json();
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0xa4b1': 'Arbitrum One',
      '0xa': 'Optimism',
      // Add L1X network ID here when known
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  const value = {
    walletAddress,
    isConnected,
    isConnecting,
    chainId,
    connectWallet,
    disconnectWallet,
    deployContract,
    mintNFT,
    getNetworkName
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};