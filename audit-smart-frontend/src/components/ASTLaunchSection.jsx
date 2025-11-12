import { useState } from 'react';
import "./ASTLaunchSection.css"; // Imp

export default function ASTLaunchSection() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="ast-launch-section">
            <div className="ast-launch-container">
                <div className="ast-launch-header">
                    <div className="badge">
                        <span className="pulse-dot"></span>
                        🚀 Token Launched
                    </div>
                    <h2>AuditSmart Token ($AST) is Now Live!</h2>
                    <p>The first AI-powered audit-verification token is officially trading on Quantum DeX</p>
                </div>

                <div className="ast-launch-details">
                    <div className="price-card">
                        <div className="price-header">
                            <span className="token-name">AST / L1X</span>
                            <span className="price-change">+461.16%</span>
                        </div>
                        <div className="price-meta">Upto</div>

                        <div className="price-value">$0.0561</div>
                        <div className="price-meta">(In Day 1)</div>
                        <div className="price-meta">Listing Price: $0.01</div>
                    </div>

                    <div className="ast-description">
                        <p>
                            <strong>AuditSmart AI ($AST)</strong> is the first tokenized audit-verification layer that transforms smart contract security into on-chain reputation. From audit reports to verified NFTs, AuditSmart empowers devs, dApps, and users to trust the code they deploy and use.
                        </p>

                        {!isExpanded && (
                            <button className="expand-btn" onClick={() => setIsExpanded(true)}>
                                Read more about AST utility
                            </button>
                        )}

                        {isExpanded && (
                            <div className="expanded-content">
                                <h4>AST Token Utility:</h4>
                                <ul>
                                    <li>Access to premium audit features</li>
                                    <li>Governance rights for AuditSmart ecosystem</li>
                                    <li>Discounts on audit services</li>
                                    <li>Staking rewards for token holders</li>
                                    <li>NFT-gated access to advanced features</li>
                                </ul>
                                <button className="collapse-btn" onClick={() => setIsExpanded(false)}>
                                    Show less
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ast-cta">
                    <a
                        href="https://l1xapp.com/pool/details/0x80740825F17Ac7cf190af3258967E5AEde949038"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trade-btn"
                    >
                        Trade AST on Quantum DeX
                    </a>
                    
                    <p className="tnc-disclaimer">
                        By trading AST, you agree to our <a href="/terms-and-conditions" className="tnc-link">Terms & Conditions</a>.
                    </p>


                </div>
            </div>
        </section>
    );
}