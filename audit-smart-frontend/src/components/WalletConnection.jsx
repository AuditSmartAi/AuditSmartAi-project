export default function WalletConnection({ 
  walletAddress, 
  walletCheckComplete,
  connectWallet
}) {
  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  return (
    <>
      {walletCheckComplete && !walletAddress && (
        <div className="wallet-connection-banner">
          <div className="banner-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
            </svg>
            <span>Wallet not connected. Please connect your wallet to use this service.</span>
            <button className="connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </>
  );
}