import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './UserProfile.css';

export default function UserProfile({ walletAddress, onClose }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://auditsmartai-mvp.onrender.com/api/v1/user-profile/${walletAddress}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [walletAddress]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const viewAuditDetails = (audit) => {
    setSelectedAudit(audit);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="badge completed">Completed</span>;
      case 'failed':
        return <span className="badge failed">Failed</span>;
      case 'pending':
        return <span className="badge pending">Pending</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="profile-modal">
        <div className="profile-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Loading Profile...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-modal">
        <div className="profile-content">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Error Loading Profile</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedAudit) {
    return (
      <div className="profile-modal">
        <div className="profile-content audit-details">
          <button className="close-btn" onClick={() => setSelectedAudit(null)}>← Back</button>
          <h2>Audit Details</h2>
          
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-row">
              <span className="detail-label">Contract Name:</span>
              <span className="detail-value">{selectedAudit.contract_name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Audit Date:</span>
              <span className="detail-value">{formatDate(selectedAudit.timestamp)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{getStatusBadge(selectedAudit.status)}</span>
            </div>
          </div>

          {selectedAudit.vulnerabilities && selectedAudit.vulnerabilities.length > 0 && (
            <div className="detail-section">
              <h3>Vulnerabilities Found</h3>
              <div className="vulnerabilities-list">
                {selectedAudit.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="vulnerability-item">
                    <div className="vuln-header">
                      <span className="vuln-severity">{vuln.severity}</span>
                      <span className="vuln-title">{vuln.title}</span>
                    </div>
                    <div className="vuln-description">{vuln.description}</div>
                    {vuln.recommendation && (
                      <div className="vuln-recommendation">
                        <strong>Recommendation:</strong> {vuln.recommendation}
                      </div>
                    )}
                    {vuln.line_number && (
                      <div className="vuln-location">
                        <strong>Location:</strong> Line {vuln.line_number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAudit.deployment && (
            <div className="detail-section">
              <h3>Deployment Information</h3>
              <div className="detail-row">
                <span className="detail-label">Contract Address:</span>
                <span className="detail-value">
                  {selectedAudit.deployment.contract_address}
                  <button 
                    onClick={() => copyToClipboard(selectedAudit.deployment.contract_address)}
                    className="copy-btn"
                  >
                    Copy
                  </button>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transaction Hash:</span>
                <span className="detail-value">
                  {selectedAudit.deployment.transaction_hash}
                  <button 
                    onClick={() => copyToClipboard(selectedAudit.deployment.transaction_hash)}
                    className="copy-btn"
                  >
                    Copy
                  </button>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Network:</span>
                <span className="detail-value">{selectedAudit.deployment.network}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gas Used:</span>
                <span className="detail-value">{selectedAudit.deployment.gas_used}</span>
              </div>
            </div>
          )}

          {selectedAudit.nft_mint && (
            <div className="detail-section">
              <h3>NFT Mint Information</h3>
              <div className="detail-row">
                <span className="detail-label">NFT Contract:</span>
                <span className="detail-value">
                  {selectedAudit.nft_mint.nft_contract}
                  <button 
                    onClick={() => copyToClipboard(selectedAudit.nft_mint.nft_contract)}
                    className="copy-btn"
                  >
                    Copy
                  </button>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Token ID:</span>
                <span className="detail-value">{selectedAudit.nft_mint.token_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Token URI:</span>
                <span className="detail-value">
                  <a href={selectedAudit.nft_mint.token_uri} target="_blank" rel="noopener noreferrer">
                    View Metadata
                  </a>
                </span>
              </div>
              {selectedAudit.nft_mint.metadata && selectedAudit.nft_mint.metadata.image && (
                <div className="nft-preview">
                  <img src={selectedAudit.nft_mint.metadata.image} alt="NFT Preview" />
                </div>
              )}
            </div>
          )}

          <div className="action-buttons">
            <button className="primary-btn" onClick={() => window.print()}>
              Print Report
            </button>
            <button className="secondary-btn" onClick={() => setSelectedAudit(null)}>
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="profile-header">
          <div className="wallet-address">
            <h2>User Profile</h2>
            <p className="wallet">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              <button onClick={() => copyToClipboard(walletAddress)} className="copy-btn">
                Copy
              </button>
            </p>
          </div>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{profileData?.audits?.length || 0}</span>
              <span className="stat-label">Audits</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profileData?.deployments?.length || 0}</span>
              <span className="stat-label">Deployments</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profileData?.nfts?.length || 0}</span>
              <span className="stat-label">NFTs</span>
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className={`profile-section ${expandedSection === 'audits' ? 'expanded' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('audits')}>
              <h3>Audit History</h3>
              <span className="toggle-icon">{expandedSection === 'audits' ? '−' : '+'}</span>
            </div>
            {expandedSection === 'audits' && (
              <div className="section-content">
                {profileData?.audits?.length > 0 ? (
                  <div className="audits-list">
                    {profileData.audits.map((audit, index) => (
                      <div key={index} className="audit-item">
                        <div className="audit-info">
                          <span className="audit-name">{audit.contract_name || 'Unnamed Contract'}</span>
                          <span className="audit-date">{formatDate(audit.timestamp)}</span>
                          {getStatusBadge(audit.status)}
                        </div>
                        <div className="audit-actions">
                          <button 
                            onClick={() => viewAuditDetails(audit)}
                            className="details-btn"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No audit history found</p>
                )}
              </div>
            )}
          </div>

          <div className={`profile-section ${expandedSection === 'deployments' ? 'expanded' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('deployments')}>
              <h3>Deployments</h3>
              <span className="toggle-icon">{expandedSection === 'deployments' ? '−' : '+'}</span>
            </div>
            {expandedSection === 'deployments' && (
              <div className="section-content">
                {profileData?.deployments?.length > 0 ? (
                  <div className="deployments-list">
                    {profileData.deployments.map((deployment, index) => (
                      <div key={index} className="deployment-item">
                        <div className="deployment-info">
                          <span className="deployment-name">{deployment.contract_name || 'Unnamed Contract'}</span>
                          <span className="deployment-address">
                            {deployment.contract_address.substring(0, 6)}...{deployment.contract_address.substring(deployment.contract_address.length - 4)}
                            <button 
                              onClick={() => copyToClipboard(deployment.contract_address)}
                              className="copy-btn"
                            >
                              Copy
                            </button>
                          </span>
                          <span className="deployment-date">{formatDate(deployment.timestamp)}</span>
                        </div>
                        <div className="deployment-actions">
                          <button 
                            onClick={() => viewAuditDetails(
                              profileData.audits.find(a => a.audit_id === deployment.audit_id)
                            )}
                            className="details-btn"
                          >
                            View Audit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No deployments found</p>
                )}
              </div>
            )}
          </div>

          <div className={`profile-section ${expandedSection === 'nfts' ? 'expanded' : ''}`}>
            <div className="section-header" onClick={() => toggleSection('nfts')}>
              <h3>Audit NFTs</h3>
              <span className="toggle-icon">{expandedSection === 'nfts' ? '−' : '+'}</span>
            </div>
            {expandedSection === 'nfts' && (
              <div className="section-content">
                {profileData?.nfts?.length > 0 ? (
                  <div className="nfts-grid">
                    {profileData.nfts.map((nft, index) => (
                      <div key={index} className="nft-card">
                        {nft.metadata?.image && (
                          <div className="nft-image">
                            <img src={nft.metadata.image} alt="NFT" />
                          </div>
                        )}
                        <div className="nft-info">
                          <h4>{nft.metadata?.name || 'Audit NFT'}</h4>
                          <p className="nft-id">Token ID: {nft.token_id}</p>
                          <p className="nft-date">{formatDate(nft.timestamp)}</p>
                          <button 
                            onClick={() => viewAuditDetails(
                              profileData.audits.find(a => a.audit_id === nft.audit_id)
                            )}
                            className="details-btn"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No NFTs found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}