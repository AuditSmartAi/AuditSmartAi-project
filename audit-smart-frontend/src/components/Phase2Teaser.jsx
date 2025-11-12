import { useState, useEffect } from 'react'

export default function Phase2Teaser() {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])



  const features = [
    {
      icon: "🛡️",
      title: "Premium Reports",
      description: "Full detailed audit reports with actionable insights and vulnerability prioritization",
      longDescription: "Get comprehensive security audit reports that go beyond simple vulnerability detection. Our premium reports include detailed explanations, risk assessments, and prioritized recommendations to help you secure your smart contracts effectively.",
      color: "#9333ea",
      bgColor: "rgba(147, 51, 234, 0.1)",
      stats: "99.7% accuracy"
    },
    {
      icon: "⚡",
      title: "Auto-Fixed Contracts",
      description: "One-click corrected versions of your smart contracts",
      longDescription: "Our AI-powered system doesn't just identify vulnerabilities - it can automatically generate corrected versions of your contracts with a single click. Save developer hours and reduce human error in the fixing process.",
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      stats: "5 min avg fix time"
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Security scoring and trend analysis over time",
      longDescription: "Track your project's security posture with our advanced analytics dashboard. Get historical trends, compare against industry benchmarks, and receive predictive insights about potential future vulnerabilities.",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      stats: "Real-time monitoring"
    },
    {
      icon: "🔗",
      title: "Multi-Chain Support",
      description: "Audit contracts across multiple blockchains",
      longDescription: "Expand your security coverage with our multi-chain audit capabilities. Support for Ethereum, Binance Smart Chain, Polygon, and other major EVM-compatible chains.",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      stats: "5+ chains supported"
    }
  ]

  const containerStyle = {
    position: 'relative',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }

  const bgElementsStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none'
  }

  const floatingBubbleStyle = {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'float 6s ease-in-out infinite'
  }

  const gridOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px'
  }

  const mainContentStyle = {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  }

  const heroStyle = {
    textAlign: 'center',
    marginBottom: '4rem'
  }

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(147, 51, 234, 0.2)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    borderRadius: '25px',
    color: '#c084fc',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '1.5rem',
    animation: 'pulse 2s infinite'
  }

  const titleStyle = {
    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #60a5fa 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.1
  }

  const gradientTextStyle = {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'shimmer 3s ease-in-out infinite'
  }

  const subtitleStyle = {
    fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
    color: '#cbd5e1',
    maxWidth: '600px',
    margin: '0 auto 2rem',
    lineHeight: 1.6
  }

  const ctaButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
    textDecoration: 'none'
  }

  const featuresGridStyle = {
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: '1fr'
  }

  const getFeatureCardStyle = (feature, index) => ({
    position: 'relative',
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${feature.color}40`,
    borderRadius: '1.5rem',
    padding: '2rem',
    transition: 'all 0.5s ease',
    cursor: 'pointer',
    overflow: 'hidden'
  })

  const featureContentStyle = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    alignItems: 'center',
    gap: '2rem'
  }

  const iconContainerStyle = (feature) => ({
    flexShrink: 0,
    position: 'relative',
    width: '100px',
    height: '100px',
    background: feature.bgColor,
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease'
  })

  const iconStyle = {
    fontSize: '3rem',
    position: 'relative',
    zIndex: 1
  }

  const contentStyle = {
    flex: 1,
    textAlign: window.innerWidth <= 768 ? 'center' : 'left'
  }

  const featureTitleStyle = (feature) => ({
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: feature.color,
    transition: 'color 0.3s ease'
  })

  const featureDescStyle = {
    fontSize: '1.125rem',
    color: '#cbd5e1',
    marginBottom: '1rem',
    lineHeight: 1.6
  }

  const featureLongDescStyle = {
    fontSize: '1rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: '1rem'
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  }

  const modalContentStyle = {
    background: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    borderRadius: '1.5rem',
    padding: '2rem',
    maxWidth: '28rem',
    width: '100%',
    position: 'relative',
    boxShadow: '0 25px 50px rgba(147, 51, 234, 0.3)'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '0.75rem',
    color: 'white',
    fontSize: '1rem',
    marginBottom: '1rem',
    transition: 'all 0.3s ease'
  }

  const modalButtonStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }

  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '2rem',
    height: '2rem',
    background: 'rgba(148, 163, 184, 0.2)',
    border: 'none',
    borderRadius: '50%',
    color: '#cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  }

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-30px) rotate(5deg); }
            66% { transform: translateY(-20px) rotate(-5deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .feature-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(147, 51, 234, 0.2);
          }
          .feature-card:hover .feature-icon {
            transform: scale(1.1) rotate(5deg);
          }
          .cta-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 35px rgba(147, 51, 234, 0.4);
          }
          .modal-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(147, 51, 234, 0.3);
          }
          .close-button:hover {
            background: rgba(148, 163, 184, 0.3);
            transform: rotate(90deg);
          }
          input:focus {
            outline: none;
            border-color: #9333ea;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3);
          }
        `}
      </style>

      <section style={containerStyle}>
        {/* Background Elements */}
        <div style={bgElementsStyle}>
          <div
            style={{
              ...floatingBubbleStyle,
              left: `${mousePosition.x * 0.02}%`,
              top: `${mousePosition.y * 0.02}%`,
              width: '300px',
              height: '300px',
              background: 'rgba(147, 51, 234, 0.1)',
              animationDelay: '0s'
            }}
          />
          <div
            style={{
              ...floatingBubbleStyle,
              right: '20%',
              top: '25%',
              width: '200px',
              height: '200px',
              background: 'rgba(59, 130, 246, 0.1)',
              animationDelay: '2s'
            }}
          />
          <div
            style={{
              ...floatingBubbleStyle,
              left: '15%',
              bottom: '25%',
              width: '150px',
              height: '150px',
              background: 'rgba(16, 185, 129, 0.1)',
              animationDelay: '4s'
            }}
          />
        </div>

        <div style={gridOverlayStyle} />

        <div style={mainContentStyle}>
          {/* Hero Section */}
          <div style={heroStyle}>
            <div style={badgeStyle}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#a855f7',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }} />
              Phase 2 Coming Soon
            </div>

            <h1 style={titleStyle}>
              Advanced <span style={gradientTextStyle}>Audit Features</span>
            </h1>

            <p style={subtitleStyle}>
              The next generation of smart contract security with{' '}
              <span style={{ color: '#a855f7', fontWeight: '600' }}>AI-powered automation</span> and{' '}
              <span style={{ color: '#3b82f6', fontWeight: '600' }}>multi-chain support</span>
            </p>

            <button
              style={ctaButtonStyle}
              className="cta-button"
              onClick={() => {
                const gmailUrl = `https://mail.google.com/mail/?view=cm&to=auditsmartai@gmail.com&su=Join%20Waitlist%20for%20Phase%202&body=Hi%20AuditSmart%20team%2C%0A%0AI'd%20like%20to%20join%20the%20Phase%202%20waitlist.%20Please%20keep%20me%20informed.%0A%0AThanks!`;
                window.open(gmailUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <span>Join Waitlist</span>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>



          </div>

          {/* Features Grid */}
          <div style={featuresGridStyle}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                style={getFeatureCardStyle(feature, index)}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${feature.color}10 0%, transparent 100%)`,
                  borderRadius: '1.5rem',
                  opacity: 0,
                  transition: 'opacity 0.5s ease'
                }} />

                <div style={featureContentStyle}>
                  <div style={iconContainerStyle(feature)}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: feature.bgColor,
                      borderRadius: '1rem',
                      filter: 'blur(10px)',
                      opacity: 0.5
                    }} />
                    <span style={iconStyle} className="feature-icon">{feature.icon}</span>

                    <div style={{
                      position: 'absolute',
                      bottom: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '0.25rem 0.75rem',
                      background: feature.bgColor,
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: feature.color,
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}>
                      {feature.stats}
                    </div>
                  </div>

                  <div style={contentStyle}>
                    <h3 style={featureTitleStyle(feature)}>
                      {feature.title}
                    </h3>

                    <p style={featureDescStyle}>
                      {feature.description}
                    </p>

                    <p style={featureLongDescStyle}>
                      {feature.longDescription}
                    </p>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
                    }}>
                      {['Security First', 'AI Powered', 'Multi-Chain'].map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: feature.bgColor,
                            color: feature.color,
                            borderRadius: '12px',
                            border: `1px solid ${feature.color}40`
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


      </section>
    </>
  )
}