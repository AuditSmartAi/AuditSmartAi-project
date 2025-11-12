import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Mail, CheckCircle, Globe, FileText } from 'lucide-react';

export default function TermsAndConditions() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'intro', title: 'Introduction', icon: FileText },
    { id: 'investment', title: 'No Investment Advice', icon: AlertTriangle },
    { id: 'risks', title: 'Risk Disclaimer', icon: Shield },
    { id: 'guarantees', title: 'No Guarantees', icon: CheckCircle },
    { id: 'jurisdiction', title: 'Jurisdiction & Compliance', icon: Globe },
    { id: 'contact', title: 'Contact', icon: Mail }
  ];

  const riskItems = [
    'Volatility in token value',
    'Regulatory changes or restrictions', 
    'Loss of access due to user error, wallet compromise, or smart contract vulnerabilities',
    'Complete loss of funds'
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundElements: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none'
    },
    orb1: {
      position: 'absolute',
      top: '25%',
      left: '25%',
      width: '384px',
      height: '384px',
      background: 'rgba(168, 85, 247, 0.2)',
      borderRadius: '50%',
      filter: 'blur(96px)',
      animation: 'pulse 4s ease-in-out infinite',
      transform: `translateY(${scrollY * 0.1}px)`
    },
    orb2: {
      position: 'absolute',
      bottom: '25%',
      right: '25%',
      width: '320px',
      height: '320px',
      background: 'rgba(59, 130, 246, 0.2)',
      borderRadius: '50%',
      filter: 'blur(96px)',
      animation: 'pulse 4s ease-in-out infinite 2s',
      transform: `translateY(${-scrollY * 0.15}px)`
    },
    orb3: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '256px',
      height: '256px',
      background: 'rgba(236, 72, 153, 0.1)',
      borderRadius: '50%',
      filter: 'blur(96px)',
      animation: 'pulse 4s ease-in-out infinite 1s'
    },
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      background: 'rgba(0, 0, 0, 0.2)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    navContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #c084fc, #f472b6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    navButtons: {
      display: 'flex',
      gap: '24px'
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      color: 'rgba(255, 255, 255, 0.7)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    },
    navButtonHover: {
      color: 'white',
      background: 'rgba(255, 255, 255, 0.1)'
    },
    mainContent: {
      position: 'relative',
      zIndex: 10,
      paddingTop: '96px',
      paddingBottom: '64px'
    },
    contentWrapper: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '0 24px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px',
      animation: 'fadeIn 1s ease-out'
    },
    mainTitle: {
      fontSize: '72px',
      fontWeight: '900',
      marginBottom: '32px',
      background: 'linear-gradient(45deg, #ffffff, #e9d5ff, #fce7f3, #ffffff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      backgroundSize: '200% 200%',
      animation: 'shimmer 3s ease-in-out infinite, float 6s ease-in-out infinite',
      lineHeight: '1.1',
      textShadow: '0 0 40px rgba(255, 255, 255, 0.5)'
    },
    lastUpdated: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    section: {
      marginBottom: '32px'
    },
    card: {
      padding: '32px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden'
    },
    cardHover: {
      background: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    iconWrapper: {
      padding: '16px',
      borderRadius: '16px',
      color: 'white',
      position: 'relative',
      animation: 'glow 3s ease-in-out infinite'
    },
    sectionTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    sectionText: {
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: '1.6',
      margin: 0
    },
    riskGrid: {
      display: 'grid',
      gap: '16px',
      marginTop: '24px',
      marginBottom: '24px'
    },
    riskItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      borderRadius: '12px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      transition: 'all 0.3s ease'
    },
    riskItemHover: {
      background: 'rgba(239, 68, 68, 0.2)'
    },
    riskDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#f87171',
      marginTop: '12px',
      flexShrink: 0
    },
    riskText: {
      color: 'rgba(255, 255, 255, 0.8)',
      margin: 0
    },
    emailButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
      color: 'white',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      marginLeft: '8px'
    },
    emailButtonHover: {
      background: 'linear-gradient(to right, #7c3aed, #db2777)',
      transform: 'translateY(-1px)'
    },
    footer: {
      textAlign: 'center',
      paddingTop: '64px'
    },
    footerBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 24px',
      borderRadius: '24px',
      background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    highlight: {
      color: '#fbbf24',
      fontWeight: '600'
    }
  };

  const keyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.05); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-10px) rotate(1deg); }
      66% { transform: translateY(5px) rotate(-1deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
      50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 60px rgba(236, 72, 153, 0.3); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      
      {/* Animated background elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.orb3} />
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>AuditSmartAI</div>
          <div style={styles.navButtons}>
            {sections.map(({ id, title, icon: Icon }) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                style={styles.navButton}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.navButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.navButton)}
              >
                <Icon size={16} />
                <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>{title}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.mainTitle}>Terms & Conditions</h1>
            <div style={styles.lastUpdated}>
              <CheckCircle color="#10b981" size={16} />
              <span>Last Updated: July 24, 2025</span>
            </div>
          </div>

          {/* Section 1: Introduction */}
          <div id="intro" style={styles.section}>
            <div 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card);
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={{...styles.iconWrapper, background: 'linear-gradient(to right, #8b5cf6, #ec4899)'}}>
                  <FileText size={24} />
                </div>
                <h2 style={styles.sectionTitle}>1. Introduction</h2>
              </div>
              <p style={styles.sectionText}>
                By accessing and using the AuditSmartAI platform, including purchasing or interacting with the AST Token, you agree to the following Terms & Conditions. These terms are intended to outline your responsibilities and the limitations of liability associated with our services and digital assets.
              </p>
            </div>
          </div>

          {/* Section 2: No Investment Advice */}
          <div id="investment" style={styles.section}>
            <div 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card);
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={{...styles.iconWrapper, background: 'linear-gradient(to right, #eab308, #f97316)'}}>
                  <AlertTriangle size={24} />
                </div>
                <h2 style={styles.sectionTitle}>2. No Investment Advice</h2>
              </div>
              <p style={styles.sectionText}>
                The AST Token is a utility token designed for access and participation within the AuditSmartAI ecosystem. It is <span style={styles.highlight}>not</span> intended to be an investment vehicle and does not represent ownership, shares, dividends, or any rights in AuditSmartAI or its assets.
              </p>
            </div>
          </div>

          {/* Section 3: Risk Disclaimer */}
          <div id="risks" style={styles.section}>
            <div 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card);
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={{...styles.iconWrapper, background: 'linear-gradient(to right, #ef4444, #ec4899)'}}>
                  <Shield size={24} />
                </div>
                <h2 style={styles.sectionTitle}>3. Risk Disclaimer</h2>
              </div>
              <p style={styles.sectionText}>
                Purchasing, holding, or using AST Tokens involves a high degree of risk, including but not limited to:
              </p>
              <div style={styles.riskGrid}>
                {riskItems.map((risk, index) => (
                  <div 
                    key={index}
                    style={styles.riskItem}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, {...styles.riskItem, ...styles.riskItemHover})}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.riskItem)}
                  >
                    <div style={styles.riskDot} />
                    <span style={styles.riskText}>{risk}</span>
                  </div>
                ))}
              </div>
              <p style={styles.sectionText}>
                By purchasing AST Tokens, you acknowledge that you understand these risks and accept that you are doing so entirely at your own discretion and responsibility.
              </p>
            </div>
          </div>

          {/* Section 4: No Guarantees */}
          <div id="guarantees" style={styles.section}>
            <div 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card);
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={{...styles.iconWrapper, background: 'linear-gradient(to right, #3b82f6, #06b6d4)'}}>
                  <CheckCircle size={24} />
                </div>
                <h2 style={styles.sectionTitle}>4. No Guarantees</h2>
              </div>
              <p style={styles.sectionText}>
                AuditSmartAI makes no warranties or guarantees regarding the future performance, adoption, or value of the AST Token. Past performance or platform usage does not indicate future outcomes.
              </p>
            </div>
          </div>

          {/* Section 5: Jurisdiction */}
          <div id="jurisdiction" style={styles.section}>
            <div 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card);
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={{...styles.iconWrapper, background: 'linear-gradient(to right, #22c55e, #10b981)'}}>
                  <Globe size={24} />
                </div>
                <h2 style={styles.sectionTitle}>5. Jurisdiction and Compliance</h2>
              </div>
              <p style={styles.sectionText}>
                It is your responsibility to ensure that your participation complies with local laws and regulations in your jurisdiction. AuditSmartAI shall not be liable for any legal consequences arising from unauthorized participation.
              </p>
            </div>
          </div>

          {/* Section 6: Contact */}
          <div id="contact" style={styles.section}>
            <div 
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.card);
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={{...styles.iconWrapper, background: 'linear-gradient(to right, #8b5cf6, #6366f1)'}}>
                  <Mail size={24} />
                </div>
                <h2 style={styles.sectionTitle}>6. Contact</h2>
              </div>
              <p style={styles.sectionText}>
                For questions regarding these terms, you can reach us at
                <a 
                  href="mailto:auditsmartai@gmail.com"
                  style={styles.emailButton}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.emailButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, styles.emailButton)}
                >
                  <Mail size={16} />
                  <span>auditsmartai@gmail.com</span>
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.footerBadge}>
              <Shield color="#a855f7" size={20} />
              <span>Protected by AuditSmartAI Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}