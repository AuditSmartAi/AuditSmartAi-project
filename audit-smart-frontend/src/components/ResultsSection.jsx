import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ResultsSection.css';
import axios from 'axios'


export default function ResultsSection({
  results,
  compilationResults,
  deploymentResults,
  mintingResults,
  onDeployRequest,
  onMintRequest,
  showDeployButton,
  showMintButton,
  isCompiling,
  isDeploying,
  isMinting,
  walletAddress,
  onWalletConnect
}) {
  const [activeTab, setActiveTab] = useState('description');
  const [copiedField, setCopiedField] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [metadataContent, setMetadataContent] = useState(null);


  // const sendMintingDataToBackend = async () => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:8000/minting-report", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(mintingResults),
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       console.log("✅ Report saved:", result);
  //     } else {
  //       console.error("❌ Failed to save report:", result);
  //     }
  //   } catch (err) {
  //     console.error("🚨 Error sending data to backend:", err);
  //   }
  // };
useEffect(() => {
  if (mintingResults) {
    const sendMintingReport = async () => {
      try {
        const response = await axios.post(
          "https://auditsmartai-mvp.onrender.com/api/v1/minting-report", 
          {
            metadata: mintingResults.metadata,
            token_id: mintingResults.token_id,
            token_uri: mintingResults.token_uri,
            nft_contract: mintingResults.nft_contract,
            transaction_hash: mintingResults.transaction_hash,
            block_number: mintingResults.block_number,
            gas_used: mintingResults.gas_used,
            recipient: mintingResults.recipient,
          }
        );

        if (response.data.is_duplicate) {
          console.log("⚠️ This minting record already exists");
        } else {
          console.log("✅ Report sent:", response.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log("⚠️ This minting record already exists");
        } else {
          console.error("❌ Failed to send minting report:", error);
        }
      }
    };

    sendMintingReport();
  }
}, [mintingResults]);
  const filterLocalPaths = (text) => {
    if (!text) return text;
    return text
      .replace(/\/.*?\/contracts\//g, '')
      .replace(/\/.*?\/node_modules\//g, '')
      .replace(/\/.*?\/src\//g, '')
      .replace(/\/.*?\//g, '')
      .replace(/\.sol/g, '');
  };

  useEffect(() => {
    if (activeTab === 'report' && !reportData) {
      loadReportData();
    }
  }, [activeTab, results?.report_uri]);

  const loadReportData = async () => {
    setLoadingReport(true);
    setError(null);
    try {
      const baseReport = {
        title: "Smart Contract Security Audit Report",
        contractName: results.contract_name || "Unknown Contract",
        auditDate: new Date().toLocaleDateString(),
        summary: {
          totalIssues: results.vulnerabilities?.length || 0,
          criticalIssues: results.vulnerabilities?.filter(v => v.severity?.toLowerCase() === 'critical').length || 0,
          highIssues: results.vulnerabilities?.filter(v => v.severity?.toLowerCase() === 'high').length || 0,
          mediumIssues: results.vulnerabilities?.filter(v => v.severity?.toLowerCase() === 'medium').length || 0,
          lowIssues: results.vulnerabilities?.filter(v => v.severity?.toLowerCase() === 'low').length || 0,
        },
        executiveSummary: "This report presents the findings of a comprehensive security audit...",
        methodology: [
          "Static Code Analysis",
          "Pattern Matching for Known Vulnerabilities",
          "Best Practices Verification",
          "Gas Optimization Review"
        ],
        findings: results.vulnerabilities || [],
        recommendations: [
          "Implement proper access controls",
          "Add input validation for all functions",
          "Use latest Solidity compiler version",
          "Follow security best practices"
        ],
        rawContent: null,
        fromIpfs: false
      };

      if (results.report_uri) {
        try {
          const ipfsHash = results.report_uri.replace('ipfs://', '');
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

          if (response.ok) {
            const content = await response.text();
            baseReport.rawContent = content;
            baseReport.fromIpfs = true;
            const summaryMatch = content.match(/##? Executive Summary\n\n([\s\S]+?)(\n##? |$)/i);
            if (summaryMatch) {
              baseReport.executiveSummary = summaryMatch[1].trim();
            }
          }
        } catch (ipfsError) {
          console.warn('IPFS fetch failed:', ipfsError);
        }
      }

      setReportData(baseReport);
    } catch (error) {
      console.error('Failed to load report data:', error);
      setError('Failed to load report content');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDeployClick = () => {
    if (!walletAddress) {
      onWalletConnect();
      return;
    }
    onDeployRequest();
  };

  const handleMintClick = () => {
    if (!walletAddress) {
      onWalletConnect();
      return;
    }
    onMintRequest();
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const SeverityBadge = ({ severity }) => {
    const severityClass = severity?.toLowerCase() || 'medium';
    return (
      <span className={`severity-badge severity-${severityClass}`}>
        {severity || 'Medium'}
      </span>
    );
  };

  const getVulnerabilityDetails = (vuln) => {
    const friendlyNames = {
      'reentrancy': 'Reentrancy Vulnerability',
      'unchecked_low_level_calls': 'Unsafe External Calls',
      'integer_overflow': 'Integer Overflow',
      'unprotected_function': 'Unrestricted Access',
      'tx_origin': 'Insecure Authorization',
      'default': vuln.vulnerability
    };

    const simplifiedDescriptions = {
      'reentrancy': 'This could allow an attacker to repeatedly withdraw funds before the contract updates its balance.',
      'unchecked_low_level_calls': 'External calls may fail silently, potentially causing unexpected behavior.',
      'integer_overflow': 'Numbers could exceed their maximum size, causing unexpected calculations.',
      'unprotected_function': 'Anyone can access this function, which should be restricted to authorized users.',
      'tx_origin': 'Using tx.origin for authorization can be bypassed by malicious contracts.',
      'default': vuln.description || 'This issue could potentially affect the security of your smart contract.'
    };

    const cleanRecommendation = vuln.recommendation
      ? filterLocalPaths(vuln.recommendation)
      : '';
    const cleanContract = vuln.contract
      ? filterLocalPaths(vuln.contract)
      : '';

    return {
      friendlyName: friendlyNames[vuln.vulnerability?.toLowerCase()] || friendlyNames['default'],
      simpleDesc: simplifiedDescriptions[vuln.vulnerability?.toLowerCase()] || simplifiedDescriptions['default'],
      cleanRecommendation,
      cleanContract
    };
  };
  // Add this component inside the ResultsSection component, before the return statement
  const TabNavigationButtons = ({ activeTab, setActiveTab }) => {
    const tabs = [
      'description',
      'vulnerabilities',
      'fixed',
      'report',
      ...(deploymentResults ? ['deployment'] : []),
      ...(mintingResults ? ['nft'] : [])
    ];

    const currentIndex = tabs.indexOf(activeTab);
    const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : null;
    const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;

    return (
      <div className="tab-navigation-buttons">
        {prevTab && (
          <button
            onClick={() => setActiveTab(prevTab)}
            className="nav-button prev-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous: {prevTab.charAt(0).toUpperCase() + prevTab.slice(1)}
          </button>
        )}
        {nextTab && (
          <button
            onClick={() => setActiveTab(nextTab)}
            className="nav-button next-button"
          >
            Next: {nextTab.charAt(0).toUpperCase() + nextTab.slice(1)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
    );
  };
  return (
    <div className="results-section">
      <div className="results-panel">
        <div className="results-header">
          <h2>
            <span className="gradient-text">Audit</span>
            <span className="gradient-text-accent">Results</span>
          </h2>

        </div>

        {showDeployButton && (
          <div className="deploy-prompt">
            <div className="deploy-card">
              <div className="deploy-info">
                <h3>Ready to Deploy</h3>
                <p>Deploy your fixed contract to L1X Network and mint your Security Audit NFT</p>
              </div>
              <button
                onClick={handleDeployClick}
                disabled={isDeploying}
                className={`deploy-btn ${walletAddress ? 'primary' : 'secondary'}`}
              >
                {isDeploying ? (
                  <>
                    <div className="spinner"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <svg className="timer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {walletAddress ? 'Deploy & Mint NFT' : 'Connect Wallet to Deploy'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="results-tabs">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`tab-btn ${activeTab === 'vulnerabilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('vulnerabilities')}
          >
            Vulnerabilities
            {results?.vulnerabilities?.length > 0 && (
              <span className="tab-badge">{results.vulnerabilities.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'fixed' ? 'active' : ''}`}
            onClick={() => setActiveTab('fixed')}
            disabled={!results?.fixed_code}
          >
            Fixed Code
          </button>
          <button
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            Full Report
          </button>
          {deploymentResults && (
            <button
              className={`tab-btn ${activeTab === 'deployment' ? 'active' : ''}`}
              onClick={() => setActiveTab('deployment')}
            >
              Deployment
            </button>
          )}
          {mintingResults && (
            <button
              className={`tab-btn ${activeTab === 'nft' ? 'active' : ''}`}
              onClick={() => setActiveTab('nft')}
            >
              NFT Details
            </button>
          )}
        </div>

        <div className="results-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <div className="contract-description">
                {results?.contract_description ? (
                  <>
                    <div className="contract-meta">
                      <div className="meta-item">
                        <span className="meta-label">Contract Name</span>
                        <span className="meta-value">{results.contract_name}</span>
                      </div>
                    </div>

                    <span className="meta-label meta-labelss">Contract Overview</span>

                    <div className="description-content">
                      <p>{results.contract_description}</p>
                    </div>
                  </>
                ) : (
                  <div className="no-description">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No description available for this contract</p>
                  </div>
                )}
              </div>
              <TabNavigationButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          )}


          {activeTab === 'vulnerabilities' && (
            <div className="tab-pane">
              <div className="vulnerabilities-container">
                {results?.llm_vulnerabilities?.vulnerabilities?.length > 0 ? (
                  <>
                    <div className="vulnerability-summary">
                      <h3>Security Summary</h3>
                      <div className="severity-stats">
                        <div className="stat-item">
                          <span className="stat-number">
                            {results.llm_vulnerabilities.total_vulnerabilities}
                          </span>
                          <span className="stat-label">Total Issues</span>
                        </div>
                        {results.llm_vulnerabilities.severity_breakdown && (
                          <>
                            <div className="stat-item critical">
                              <span className="stat-number">
                                {results.llm_vulnerabilities.severity_breakdown.critical || 0}
                              </span>
                              <span className="stat-label">Critical</span>
                            </div>
                            <div className="stat-item high">
                              <span className="stat-number">
                                {results.llm_vulnerabilities.severity_breakdown.high || 0}
                              </span>
                              <span className="stat-label">High</span>
                            </div>
                            <div className="stat-item medium">
                              <span className="stat-number">
                                {results.llm_vulnerabilities.severity_breakdown.medium || 0}
                              </span>
                              <span className="stat-label">Medium</span>
                            </div>
                            <div className="stat-item low">
                              <span className="stat-number">
                                {results.llm_vulnerabilities.severity_breakdown.low || 0}
                              </span>
                              <span className="stat-label">Low</span>
                            </div>
                          </>
                        )}
                        <div className="stat-item">
                          <span className="stat-number">
                            {results.llm_vulnerabilities.overall_risk_score}/10
                          </span>
                          <span className="stat-label">Risk Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="vulnerabilities-list">
                      <h3>Detailed Findings</h3>
                      {results.llm_vulnerabilities.vulnerabilities.map((vuln, index) => {
                        const {
                          friendlyName,
                          simpleDesc,
                          cleanRecommendation,
                          cleanContract
                        } = getVulnerabilityDetails(vuln);

                        return (
                          <div key={index} className="vulnerability-item">
                            <div className="vulnerability-header">
                              <div className="vulnerability-title-group">
                                <h4 className="vulnerability-title">{friendlyName}</h4>
                                <SeverityBadge severity={vuln.severity} />
                              </div>
                              {vuln.confidence && (
                                <div className="confidence-badge">
                                  Confidence: {vuln.confidence}
                                </div>
                              )}
                            </div>

                            <div className="vulnerability-content">
                              <div className="vulnerability-description">
                                <h5>Description</h5>
                                <p>{simpleDesc}</p>
                              </div>

                              {vuln.location && (
                                <div className="vulnerability-location">
                                  <h5>Location</h5>
                                  <p>{vuln.location}</p>
                                </div>
                              )}

                              {cleanRecommendation && (
                                <div className="vulnerability-recommendation">
                                  <h5>Recommendation</h5>
                                  <p>{cleanRecommendation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="no-vulnerabilities">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h3>No Security Issues Found</h3>
                    <p>Your smart contract has passed all security checks</p>
                  </div>
                )}
              </div>
              <TabNavigationButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'fixed' && results?.fixed_code && (
            <div className="tab-pane">
              <div className="code-container">
                <div className="code-header">
                  <span>SOLIDITY</span>
                  <div className="code-actions">
                    <button
                      className="code-action-btn"
                      onClick={() => handleCopy(results.fixed_code, 'code')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      {copiedField === 'code' ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(results.fixed_code)}`}
                      download={`${results.contract_name || 'contract'}_fixed.sol`}
                      className="code-action-btn primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
                <pre className="code-block">
                  <code>{results.fixed_code}</code>
                </pre>
              </div>
              <TabNavigationButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="tab-pane">
              {loadingReport ? (
                <div className="loading-report">
                  <div className="spinner"></div>
                  <p>Loading detailed report...</p>
                </div>
              ) : error ? (
                <div className="report-error">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <h3>Could not load report</h3>
                  <p>{error}</p>
                  {results?.report_uri && (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${results.report_uri.replace('ipfs://', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-pdf-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Try Viewing Full Report
                    </a>
                  )}
                </div>
              ) : reportData ? (
                <div className="audit-report">
                  <div className="report-header">
                    <div className="report-title-section">
                      <h1 className="report-title">{reportData.title}</h1>
                      <div className="report-meta">
                        <div className="report-meta-item">
                          <span className="meta-label">Contract:</span>
                          <span className="meta-value">{reportData.contractName}</span>
                        </div>
                        <div className="report-meta-item">
                          <span className="meta-label">Audit Date:</span>
                          <span className="meta-value">{reportData.auditDate}</span>
                        </div>
                        {results?.report_uri && (
                          <div className="report-meta-item">
                            <a
                              href={`https://gateway.pinata.cloud/ipfs/${results.report_uri.replace('ipfs://', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="download-pdf-btn"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              {reportData.fromIpfs ? 'Download PDF' : 'View Full Report'}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {reportData.fromIpfs ? (
                    <div className="markdown-report-content">
                      <ReactMarkdown>
                        {reportData.rawContent.replace(/([A-Z]:)?[\\/][\w\\/. \-]+\.sol(#\d+(-\d+)?)?/gi, '')}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <>
                      <section className="report-section">
                        <h2 className="section-title">Executive Summary</h2>
                        <div className="section-content">
                          <p className="executive-summary-text">
                            {reportData.executiveSummary.replace(/([A-Z]:)?[\\/][\w\\/. \-]+\.sol(#\d+(-\d+)?)?/gi, '')}
                          </p>
                          <div className="summary-stats">
                            <div className="stat-grid">
                              {Object.entries(reportData.summary).map(([key, value]) => (
                                <div key={key} className={`stat-item ${key.toLowerCase()}`}>
                                  <div className="stat-number">{value}</div>
                                  <div className="stat-label">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace('Issues', '')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="report-section">
                        <h2 className="section-title">Audit Methodology</h2>
                        <div className="section-content">
                          <div className="methodology-grid">
                            {reportData.methodology.map((method, index) => (
                              <div key={index} className="methodology-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>{method}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section className="report-section">
                        <h2 className="section-title">Detailed Findings</h2>
                        <div className="section-content">
                          {reportData.findings.length > 0 ? (
                            <div className="findings-list">
                              {reportData.findings.map((finding, index) => {
                                const {
                                  friendlyName,
                                  simpleDesc,
                                  cleanRecommendation,
                                  cleanContract
                                } = getVulnerabilityDetails(finding);

                                return (
                                  <div key={index} className="finding-item">
                                    <div className="finding-header">
                                      <div className="finding-title-group">
                                        <h3 className="finding-title">{friendlyName}</h3>
                                        <SeverityBadge severity={finding.severity} />
                                      </div>
                                      <div className="finding-meta">
                                        <span className="confidence-indicator">
                                          Confidence: {finding.confidence || 'N/A'}
                                        </span>
                                        {finding.line && (
                                          <span className="line-indicator">
                                            Line {finding.line}
                                            {cleanContract && ` in ${cleanContract.replace(/([A-Z]:)?[\\/][\w\\/. \-]+\.sol(#\d+(-\d+)?)?/gi, '')}`}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="finding-content">
                                      <div className="finding-description">
                                        <h4>Description</h4>
                                        <p>{simpleDesc.replace(/([A-Z]:)?[\\/][\w\\/. \-]+\.sol(#\d+(-\d+)?)?/gi, '')}</p>
                                      </div>
                                      {cleanRecommendation && (
                                        <div className="finding-recommendation">
                                          <h4>Recommendation</h4>
                                          <p>{cleanRecommendation.replace(/([A-Z]:)?[\\/][\w\\/. \-]+\.sol(#\d+(-\d+)?)?/gi, '')}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="no-findings">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              <h3>No Security Issues Found</h3>
                              <p>Your smart contract has passed all security checks</p>
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="report-section">
                        <h2 className="section-title">General Recommendations</h2>
                        <div className="section-content">
                          <div className="recommendations-list">
                            {reportData.recommendations.map((recommendation, index) => (
                              <div key={index} className="recommendation-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                </svg>
                                <span>{recommendation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    </>
                  )}

                  <div className="report-footer">
                    <div className="footer-content">
                      <p>This report was generated using AuditSmartAi security analysis tools.</p>
                      <div className="footer-meta">
                        <span>Generated on {new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-report-data">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3>No Report Data Available</h3>
                  <p>The audit report could not be generated for this contract.</p>
                </div>
              )}
              <TabNavigationButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'deployment' && deploymentResults && (
            <div className="tab-pane">
              <div className="deployment-details">
                <div className="detail-card success">
                  <div className="detail-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h3>Deployment Successful</h3>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Contract Address</span>
                      <div className="detail-value">
                        <span>{deploymentResults.contract_address}</span>
                        <button
                          onClick={() => handleCopy(deploymentResults.contract_address, 'contractAddress')}
                          className="copy-btn"
                        >
                          {copiedField === 'contractAddress' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Transaction Hash</span>
                      <div className="detail-value">
                        <span>{deploymentResults.transaction_hash}</span>
                        <button
                          onClick={() => handleCopy(deploymentResults.transaction_hash, 'txHash')}
                          className="copy-btn"
                        >
                          {copiedField === 'txHash' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Block Number</span>
                      <span className="detail-value">{deploymentResults.block_number}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Network</span>
                      <a
                        href="https://l1xapp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-value"
                        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                      >
                        L1X Network
                      </a>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Deployer</span>
                      <span className="detail-value">{walletAddress}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Explorer</span>
                      <span className="detail-value">
                        <a
                          href={`https://l1xapp.com/explorer/tx/${deploymentResults.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          View on Explorer
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                {showMintButton && (
                  <div className="mint-prompt">
                    <div className="mint-card">
                      <div className="mint-info">
                        <h3>Mint Your Audit NFT</h3>
                        <p>Claim your exclusive Security Audit NFT as proof of your smart contract deployment</p>
                      </div>
                      <button
                        onClick={handleMintClick}
                        disabled={isMinting}
                        className={`mint-btn ${walletAddress ? 'primary' : 'secondary'}`}
                      >
                        {isMinting ? (
                          <>
                            <div className="spinner"></div>
                            Minting...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                            </svg>
                            {walletAddress ? 'Mint NFT Now' : 'Connect Wallet to Mint'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <TabNavigationButtons activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          )}

          {activeTab === 'nft' && mintingResults && (
            <div className="tab-pane">
              <div className="nft-details">
                <div className="nft-card">
                  <div className="nft-preview">
                    <div className="nft-image">
                      <img
                        src={mintingResults.metadata.image}
                        alt="NFT Preview"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setMetadataContent(mintingResults.metadata);
                        setShowMetadataModal(true);
                      }}
                      className="view-metadata-btn"
                    >
                      View Metadata
                    </button>

                  </div>
                  <div className="nft-info">
                    <h3>{mintingResults.metadata.name}</h3>
                    <p className="nft-description">{mintingResults.metadata.description}</p>

                    <div className="nft-detail-grid">
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Token ID</span>
                        <span className="nft-detail-value">{mintingResults.token_id}</span>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">NFT Contract</span>
                        <div className="nft-detail-value">
                          <span>{mintingResults.nft_contract}</span>
                          <button
                            onClick={() => handleCopy(mintingResults.nft_contract, 'nftContract')}
                            className="copy-btn"
                          >
                            {copiedField === 'nftContract' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Transaction Hash</span>
                        <div className="nft-detail-value">
                          <span>{mintingResults.transaction_hash}</span>
                          <button
                            onClick={() => handleCopy(mintingResults.transaction_hash, 'nftTxHash')}
                            className="copy-btn"
                          >
                            {copiedField === 'nftTxHash' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Block Number</span>
                        <span className="nft-detail-value">{mintingResults.block_number}</span>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Gas Used</span>
                        <span className="nft-detail-value">{mintingResults.gas_used}</span>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Recipient</span>
                        <span className="nft-detail-value">{mintingResults.recipient}</span>
                      </div>
                      <div className="nft-detail-item">
                        <span className="nft-detail-label">Explorer</span>
                        <a
                          href={`https://l1xapp.com/explorer/tx/${mintingResults.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <TabNavigationButtons activeTab={activeTab} setActiveTab={setActiveTab} />
              {showMetadataModal && metadataContent && (
  <div className="nft-modal-overlay" onClick={() => setShowMetadataModal(false)}>
    <div className="nft-modal-content" onClick={(e) => e.stopPropagation()}>
      <button
        className="nft-close-btn"
        onClick={() => setShowMetadataModal(false)}
      >
        ✕
      </button>
      <h2>{metadataContent.name || "NFT Metadata"}</h2>
      <p>{metadataContent.description}</p>

      {metadataContent.attributes?.length > 0 && (
        <ul className="nft-attributes-list">
          {metadataContent.attributes.map((attr, i) => (
            <li key={i}>
              <strong>{attr.trait_type}</strong>
              <span>{attr.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}