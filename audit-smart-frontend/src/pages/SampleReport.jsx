import React, { useEffect, useState } from "react";
import axios from "axios";
import { ExternalLink, Hash, Zap, Clock, Package, ImageIcon } from "lucide-react";
import "./SampleReport.css";

const resolveIpfs = (uri) => {
  if (uri?.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
};

const SampleReport = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  useEffect(() => {
    async function fetchWallet() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const addr = accounts[0].toLowerCase();
        setWalletAddress(addr);
        fetchReports(addr);
      }
    }

    fetchWallet();
  }, []);

  const fetchReports = async (address) => {
    try {
      const res = await axios.get(`https://auditsmartai-mvp.onrender.com/api/v1/minting-reports/${address}`);
      const fullReports = await Promise.all(
        res.data.reports.map(async (report) => {
          try {
            const tokenUri = report.metadata?.token_uri || report.token_uri;
            const resolvedUri = resolveIpfs(tokenUri);
            if (resolvedUri && resolvedUri.startsWith("https://")) {
              const meta = await axios.get(resolvedUri);
              return {
                ...report,
                metadataPreview: meta.data,
              };
            }
          } catch (e) {
            console.warn("⚠️ Failed to fetch token URI metadata:", e);
          }
          return report;
        })
      );
      setReports(fullReports);
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num) => {
    if (!num) return "N/A";
    return num.toLocaleString();
  };

  return (
    <div className="blast-container">
      <div className="blast-content">
        <div className="blast-header">
          <div className="blast-title">
            <Package size={32} className="blast-title-icon" />
            <h1>Your Minted Contracts</h1>
          </div>
          {walletAddress && (
            <div className="blast-wallet-info">
              <div className="blast-status-dot"></div>
              <span>Connected: {truncateAddress(walletAddress)}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="blast-loading-container">
            <div className="blast-spinner"></div>
            <p>Loading your contracts...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="blast-empty-state">
            <p>No minted contracts found for your wallet.</p>
          </div>
        ) : (
          <>
            <div className="blast-cards-grid">
              {reports.map((report) => {
                const tokenId = report.token_id || report.metadata?.token_id || "N/A";
                const tokenUri = resolveIpfs(report.token_uri || report.metadata?.token_uri || "");
                const preview = report.metadataPreview || {};

                return (
                  <div key={report._id} className="blast-card">
                    <div className="blast-image-container">
                      {preview.image ? (
                        <img 
                          src={resolveIpfs(preview.image)} 
                          alt="NFT" 
                          className="blast-nft-image"
                        />
                      ) : (
                        <div className="blast-placeholder-image">
                          <ImageIcon size={48} />
                        </div>
                      )}
                    </div>

                    <div className="blast-info-grid">
                      <div className="blast-info-row">
                        <span className="blast-info-label">Token ID</span>
                        <span className="blast-info-value blast-token-id">
                          #{tokenId}
                        </span>
                      </div>
                      <div className="blast-info-row">
                        <span className="blast-info-label">URI</span>
                        <button 
                          className="blast-link" 
                          onClick={() => setSelectedMetadata(preview)}
                        >
                          <ExternalLink size={12} />
                          View
                        </button>
                      </div>
                      <div className="blast-info-row">
                        <span className="blast-info-label">Contract</span>
                        <span className="blast-info-value blast-address">
                          {truncateAddress(report.nft_contract)}
                        </span>
                      </div>
                      <div className="blast-info-row">
                        <span className="blast-info-label">
                          <Hash size={12} /> Tx Hash
                        </span>
                        <span className="blast-info-value blast-address">
                          {truncateAddress(report.transaction_hash)}
                        </span>
                      </div>
                      <div className="blast-info-row">
                        <span className="blast-info-label">
                          <Zap size={12} /> Gas
                        </span>
                        <span className="blast-info-value">
                          {formatNumber(report.gas_used)}
                        </span>
                      </div>
                      <div className="blast-info-row">
                        <span className="blast-info-label">
                          <Clock size={12} /> Created
                        </span>
                        <span className="blast-date-value">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="blast-footer">
              <div className="blast-stats-card">
                <Package size={16} className="blast-stats-icon" />
                <span>Total Contracts: {reports.length}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedMetadata && (
        <div className="blast-modal-overlay">
          <div className="blast-modal-content">
            <button
              className="blast-modal-close"
              onClick={() => setSelectedMetadata(null)}
            >
              ✕
            </button>

            <div className="blast-modal-left">
              <h2>{selectedMetadata.name || "NFT Details"}</h2>
              <p>
                {selectedMetadata.description}
              </p>
            </div>

            <div className="blast-modal-right">
              <h3>Metadata</h3>
              <ul className="blast-attributes-list">
                {selectedMetadata.attributes?.map((attr, i) => (
                  <li key={i}>
                    <strong>{attr.trait_type}</strong>
                    <span>{attr.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleReport;