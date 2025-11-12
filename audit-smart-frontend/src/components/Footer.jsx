import { FaInstagram, FaTwitter, FaTelegram, FaDiscord } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="brand-section">
          <h3 className="brand-name">
            <span className="gradient-text">AUDIT</span>
            <span className="glowing-text">SMART</span>
            <span className="ai-text">AI</span>
          </h3>
          <p className="brand-tagline">
            Advanced AI-Powered Blockchain Security Solutions
          </p>
        </div>

        {/* Social Media Links */}
        <div className="social-section">
          <h4 className="social-title">Connect With Us</h4>
          <div className="social-icons">
            <a
              href="https://www.instagram.com/auditsmartai?igsh=MWhnMjRjeHo4YzhzOQ=="
              className="social-icon instagram"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://x.com/AuditSmart_2025?t=BtpUyDRKMWqUq_O5aXwoxQ&s=09"
              className="social-icon twitter"
              aria-label="Twitter/X"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://t.me/auditsmartai_updates"
              className="social-icon telegram"
              aria-label="Telegram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTelegram />
            </a>
            <a
              href="https://discord.com/channels/1377491174582911026/1377492787158843432"
              className="social-icon discord"
              aria-label="Discord"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="copyright-section">
        <div className="copyright-content">
          <p>© {new Date().getFullYear()} AuditSmartAI. All rights reserved.</p>
          <div className="legal-links">
            Contact us :
            <a
              href="mailto:auditsmartai@gmail.com?subject=AuditSmartAI%20Support%20Request&body=Hi%20Team%2C%0A%0AI%20need%20assistance%20regarding%20...%0A%0AThanks%2C%0A[Your%20Name]"
              className="legal-link"
              rel="noopener noreferrer"
            >
              auditsmartai@gmail.com
            </a>


            <span className="legal-separator">|</span>
            <a
              href="/terms-and-conditions"
              className="legal-link"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}