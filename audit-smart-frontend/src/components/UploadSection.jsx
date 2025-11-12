import { useState, useEffect } from 'react';
import "./UploadSection.css";

export default function UploadSection({
  file,
  setFile,
  pastedCode,
  setPastedCode,
  isAnalyzing,
  error,
  setError,
  walletAddress,
  handleSubmit,
  showWalletPrompt,
  setShowWalletPrompt,
  connectWallet
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [activeUploadMethod, setActiveUploadMethod] = useState('file');
  const [progress, setProgress] = useState(0);
  const [showWalletStatus, setShowWalletStatus] = useState(false);
  const [walletStatus, setWalletStatus] = useState({
    message: 'Not connected',
    isConnected: false,
    showPulse: false
  });
  const [progressPhase, setProgressPhase] = useState("");

  useEffect(() => {
    if (walletAddress) {
      setWalletStatus({
        message: `Connected: ${truncateAddress(walletAddress)}`,
        isConnected: true,
        showPulse: true
      });

      const timer = setTimeout(() => {
        setWalletStatus(prev => ({ ...prev, showPulse: false }));
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setWalletStatus({
        message: 'Not connected',
        isConnected: false,
        showPulse: false
      });
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isAnalyzing]);
  useEffect(() => {
    if (!isAnalyzing) {
      setProgressPhase("");
      return;
    }

    const phases = [
      "Analyzing with Slither...",
      "Running LLM Analysis...",
      "Generating Fix...",
      "Creating Report...",
      "Finalizing..."
    ];
    let phaseIndex = 0;

    setProgressPhase(phases[phaseIndex]);

    const phaseInterval = setInterval(() => {
      phaseIndex++;
      if (phaseIndex < phases.length) {
        setProgressPhase(phases[phaseIndex]);
      } else {
        clearInterval(phaseInterval);
      }
    }, 3000); // 3 seconds per phase

    return () => clearInterval(phaseInterval);
  }, [isAnalyzing]);

  const handleSubmitWithWalletCheck = (e) => {
    e.preventDefault();

    if (!walletAddress) {
      setShowWalletStatus(true);
      setShowWalletPrompt(true);
      return;
    }

    handleSubmit(e);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setActiveUploadMethod('file');
    }
  };

  const handlePasteSubmit = () => {
    if (pastedCode.trim()) {
      setShowPasteModal(false);
      setActiveUploadMethod('paste');
      setFile(new File([pastedCode], "pasted_contract.sol", { type: "text/plain" }));
    }
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  return (
    <div className="upload-section">

      <form onSubmit={handleSubmitWithWalletCheck} className="audit-form">
        <div className="form-header">

          <div className="form-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2>Upload Contract</h2>
          <p className="form-description">Upload your Solidity contract for comprehensive security analysis</p>
          <p className="form-description">Please try to upload sol file without character to get best performance!!</p>
        </div>

        <div className="upload-method-tabs">
          <button
            type="button"
            className={`method-tab ${activeUploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setActiveUploadMethod('file')}
          >
            Upload File
          </button>
          <button
            type="button"
            className={`method-tab ${activeUploadMethod === 'paste' ? 'active' : ''}`}
            onClick={() => {
              setShowPasteModal(true);
              setActiveUploadMethod('paste');
            }}
          >
            Paste Code
          </button>
        </div>

        {activeUploadMethod === 'file' ? (
          <div
            className={`file-upload ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            <input
              type="file"
              id="contract-upload"
              accept=".sol"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setActiveUploadMethod('file');
              }}
            />
            <label htmlFor="contract-upload">
              <div className="upload-content">
                {file ? (
                  <>
                    <div className="file-preview">
                      <svg className="file-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon-container">
                      <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div className="upload-text-container">
                      <p className="upload-text">
                        <span className="browse-link">Click to upload</span> or drag and drop
                      </p>
                      <p className="upload-hint">Solidity (.sol) files only</p>
                    </div>
                  </>
                )}
              </div>
            </label>
            {file && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => {
                  setFile(null);
                  setPastedCode('');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="paste-preview">
            {file ? (
              <div className="code-preview">
                <pre>{pastedCode.substring(0, 200)}{pastedCode.length > 200 ? '...' : ''}</pre>
                <button
                  type="button"
                  className="edit-paste-btn"
                  onClick={() => setShowPasteModal(true)}
                >
                  Edit Code
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="paste-placeholder"
                onClick={() => setShowPasteModal(true)}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                <span>Click to paste Solidity code</span>
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          className={`submit-btn ${(!file && !pastedCode) || isAnalyzing ? 'disabled' : ''}`}
          disabled={(!file && !pastedCode) || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="spinner mr-2"></span>
              {progressPhase || "Analyzing..."}
            </>
          ) : (
            <>
              <svg className="submit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Start Audit
            </>
          )}

        </button>


        {isAnalyzing && (
          <div className="progress-container">
            <div className="progress-indicator">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {progressPhase || "Analyzing..."} {Math.min(100, Math.round(progress))}%
            </p>
          </div>
        )}

      </form>

      {showWalletPrompt && (
        <div className="wallet-prompt-overlay">
          <div className="wallet-prompt">
            <div className="prompt-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1-11.21 3 7 7 0 0 0 21 12.79z"></path>
                <path d="M12 7v6l3 3"></path>
              </svg>
              <h3>Wallet Required</h3>
              <p>Please connect your wallet to start the audit process.</p>
              <div className="prompt-actions">
                <button
                  className="prompt-btn secondary"
                  onClick={() => {
                    setShowWalletPrompt(false);
                    setShowWalletStatus(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="prompt-btn primary"
                  onClick={() => {
                    connectWallet();
                    setShowWalletStatus(true);
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWalletStatus && !walletAddress && (
        <div className="wallet-status-message">
          <div className="wallet-status-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            <div>
              <h4>Wallet Not Connected</h4>
              <p>You need to connect your wallet to start the audit.</p>
            </div>
            <button
              className="close-status"
              onClick={() => setShowWalletStatus(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="error-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
          </div>
          <div className="error-content">
            <h3>Analysis Failed</h3>
            <p>{error}</p>
          </div>
          <button
            className="error-close"
            onClick={() => setError(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {showPasteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Paste Solidity Code</h3>
              <button
                className="modal-close"
                onClick={() => setShowPasteModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="code-textarea-container" data-count={pastedCode.length}>

                <textarea
                  className="code-textarea"
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  placeholder="Paste your Solidity contract code here..."
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel"
                onClick={() => setShowPasteModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handlePasteSubmit}
                disabled={!pastedCode.trim()}
              >
                Submit Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}