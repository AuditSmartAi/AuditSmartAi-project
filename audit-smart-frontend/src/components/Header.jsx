import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isHoveringConnect, setIsHoveringConnect] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false); // Track manual disconnection
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for wallet connection on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      // Don't auto-connect if user manually disconnected
      if (isDisconnected) return;

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0 && !isDisconnected) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0 || isDisconnected) {
          setWalletAddress(null);
        } else if (!isDisconnected) {
          setWalletAddress(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [isDisconnected]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsDisconnected(false); // Reset disconnection state
        setIsOpen(false);

        // Add success animation class temporarily
        const btn = document.querySelector('.connect-wallet-btn');
        if (btn) {
          btn.classList.add('success-animation');
          setTimeout(() => btn.classList.remove('success-animation'), 2000);
        }
      } catch (err) {
        console.error('Wallet connection error:', err);
        if (err.code === 4001) {
          // User rejected the request
          console.log('User rejected wallet connection');
        }
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask.');
    }
  };

  const disconnectWallet = async () => {
    try {
      // Add disconnect animation
      const btn = document.querySelector('.user-profile');
      if (btn) {
        btn.classList.add('disconnect-animation');
      }

      // Set disconnection state to prevent auto-reconnection
      setIsDisconnected(true);

      // Clear the wallet address from state
      setTimeout(() => {
        setWalletAddress(null);
        if (btn) {
          btn.classList.remove('disconnect-animation');
        }
      }, 500);

      // Optional: You can also try to disconnect from MetaMask programmatically
      // Note: This method may not be available in all MetaMask versions
      if (window.ethereum && window.ethereum.request) {
        try {
          // Some versions of MetaMask support wallet_revokePermissions
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (revokeError) {
          // If revoke permissions fails, that's okay - we've still cleared local state
          console.log('Permission revocation not supported or failed:', revokeError.message);
        }
      }

    } catch (err) {
      console.error('Disconnect error:', err);
      // Still clear local state even if MetaMask disconnect fails
      setWalletAddress(null);
      setIsDisconnected(true);
    }
  };

  // Function to reset disconnection state (useful if you want to allow reconnection)
  const resetDisconnectionState = () => {
    setIsDisconnected(false);
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-decoration"></div>
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <img
              src="/AuditSmart-LOGO.png"
              alt="AuditSmart AI Logo"
              width={50}
              className="logo-pulse"
            />
          </div>
          <span className="logo-text">
            <span className="gradient-text span-txt">Audit</span><span className="span-txt">Smart</span><span className='ai-txt span-txt'>AI</span>
          </span>
        </Link>

        <nav className={`nav ${isOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/audit"
            className={`nav-link ${location.pathname === '/audit' ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Audit
          </Link>
          <Link
            to="/reports"
            className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Reports
          </Link>
          <Link
            to="/asa-tokenomics"
            className={`nav-link ${location.pathname === '/asa-tokenomics' ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Blog
          </Link>
          {walletAddress ? (
            <div className="user-profile">
              <div className="profile-badge glow-on-hover">
                <span className="wallet-address">{truncateAddress(walletAddress)}</span>
              </div>
              <button onClick={disconnectWallet} className="logout-btn gradient-hover">
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="connect-wallet-btn gradient-hover"
              onMouseEnter={() => setIsHoveringConnect(true)}
              onMouseLeave={() => setIsHoveringConnect(false)}
            >
              <span>Connect Wallet</span>
              {isHoveringConnect && (
                <div className="connect-ripple"></div>
              )}
            </button>
          )}
        </nav>

        <button
          className={`mobile-menu-btn ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={28} className="menu-icon-animate" />
          ) : (
            <Menu size={28} className="menu-icon-animate" />
          )}
        </button>
      </div>
    </header>
  );
}