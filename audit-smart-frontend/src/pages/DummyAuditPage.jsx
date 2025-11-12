import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, Zap, Clock, CheckCircle, AlertTriangle, Code, FileText, Lock, Mail } from 'lucide-react';

export default function DummyAuditPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('initial');
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const particlesRef = useRef(null);
  const scanLinesRef = useRef(null);

  const steps = [
    { icon: Code, text: "Analyzing Smart Contract", color: "#9cf4ff" },
    { icon: Shield, text: "Security Vulnerability Scan", color: "#ffd700" },
    { icon: AlertTriangle, text: "Risk Assessment", color: "#ff7b54" },
    { icon: CheckCircle, text: "Generating Report", color: "#6e45e2" }
  ];

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Create animated background particles
    const createParticles = () => {
      if (particlesRef.current) {
        const particleCount = isMobile ? 50 : 100;
        const particlesContainer = particlesRef.current;
        particlesContainer.innerHTML = '';

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: ${Math.random() > 0.5 ? '#60a5fa' : '#ffffff'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.7 + 0.3};
            animation: particleFloat ${Math.random() * 15 + 10}s infinite linear;
            box-shadow: 0 0 ${Math.random() * 20 + 10}px currentColor;
          `;
          particlesContainer.appendChild(particle);
        }
      }
    };

    // Create scanning lines effect
    const createScanLines = () => {
      if (scanLinesRef.current) {
        scanLinesRef.current.innerHTML = '';
        for (let i = 0; i < (isMobile ? 1 : 2); i++) {
          const line = document.createElement('div');
          line.style.cssText = `
            position: absolute;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, transparent, #60a5fa, transparent);
            top: ${Math.random() * 100}%;
            animation: scanLineMove ${Math.random() * 4 + 3}s infinite linear;
            opacity: 0.8;
            box-shadow: 0 0 20px #60a5fa;
          `;
          scanLinesRef.current.appendChild(line);
        }
      }
    };

    const timer = setTimeout(() => {
      setIsLoading(false);
      createParticles();
      createScanLines();
      setAnimationPhase('scanning');
    }, 1000);

    // Simulate audit progress
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setAnimationPhase('complete');
            setTimeout(() => {
              setShowComingSoon(true);
            }, 1000);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 2 + 0.5;
      });
    }, 100);

    // Step progression
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const goBack = () => {
    window.history.back();
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailValid(true); // Reset validation on change
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simple email validation
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setIsEmailValid(isValid);
    
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send the email to your backend here
      console.log('Subscribed email:', email);
      
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f23 50%, #000000 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff'
    }}>
      <style>{`
        @keyframes particleFloat {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes scanLineMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 80px currentColor; 
            transform: scale(1.1);
          }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-12px,0); }
          70% { transform: translate3d(0,-6px,0); }
          90% { transform: translate3d(0,-3px,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes progressShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .hover-lift:hover { 
          transform: translateY(-5px) scale(1.02); 
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .hover-glow:hover {
          box-shadow: 0 0 30px currentColor;
        }
        .progress-bar {
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          background-size: 200px 100%;
          animation: progressShimmer 2s infinite linear;
        }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .neon-border {
          border: 2px solid transparent;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: subtract;
          mask-composite: exclude;
        }
      `}</style>

      {/* Background Effects */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      <div ref={scanLinesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      {/* Navigation */}
      <nav style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: isMobile ? '20px 15px' : '30px'
      }}>
        <button 
          onClick={goBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '10px 15px' : '12px 20px',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '16px',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit'
          }}
          className="hover-lift"
          onMouseEnter={(e) => {
            e.target.style.color = 'white';
            e.target.style.background = 'rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
            e.target.style.background = 'rgba(0, 0, 0, 0.3)';
          }}
        >
          <ArrowLeft size={isMobile ? 16 : 20} />
          Back to Home
        </button>
      </nav>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: isMobile ? '80px 15px 40px' : '40px 20px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          width: '100%',
          padding: isMobile ? '0' : '0 20px'
        }}>
          
          {!showComingSoon ? (
            /* Audit Simulation Interface */
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '25px 20px' : '50px',
              animation: 'slideUp 0.8s ease-out forwards',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              margin: isMobile ? '0' : '0 auto'
            }} className="glass-card">
              
              {/* Header */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: isMobile ? '30px' : '50px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: isMobile ? '12px' : '20px',
                  marginBottom: isMobile ? '15px' : '25px',
                  flexDirection: isMobile ? 'column' : 'row'
                }}>
                  <div style={{
                    width: isMobile ? '60px' : '70px',
                    height: isMobile ? '60px' : '70px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'glow 3s ease-in-out infinite',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                  }}>
                    <Shield size={isMobile ? 24 : 32} color="white" />
                  </div>
                  <h1 style={{
                    fontSize: isMobile ? '28px' : '42px',
                    fontWeight: '700',
                    margin: 0,
                    background: 'linear-gradient(135deg, #ffffff, #60a5fa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Smart Contract Audit
                  </h1>
                </div>
                <p style={{
                  color: '#cbd5e1',
                  margin: 0,
                  fontSize: isMobile ? '14px' : '18px',
                  fontWeight: '400'
                }}>
                  AI-powered security analysis in progress...
                </p>
              </div>

              {/* Progress Section */}
              <div style={{ marginBottom: isMobile ? '30px' : '50px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <span style={{ 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: '600', 
                    color: '#e2e8f0' 
                  }}>
                    Analysis Progress
                  </span>
                  <span style={{ 
                    fontSize: isMobile ? '16px' : '18px', 
                    fontWeight: '700', 
                    color: '#60a5fa',
                    textShadow: '0 0 10px currentColor'
                  }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '15px',
                  height: isMobile ? '12px' : '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    borderRadius: '15px',
                    transition: 'width 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }} className="progress-bar">
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255, 255, 255, 0.2)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}></div>
                  </div>
                </div>
              </div>

              {/* Steps Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: isMobile ? '20px' : '30px',
                marginBottom: isMobile ? '30px' : '50px'
              }}>
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep || (progress === 100 && index <= currentStep);
                  
                  return (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '15px' : '20px',
                        padding: isMobile ? '18px' : '25px',
                        borderRadius: '16px',
                        border: `2px solid ${
                          isActive 
                            ? 'rgba(59, 130, 246, 0.5)' 
                            : isCompleted 
                              ? 'rgba(34, 197, 94, 0.5)'
                              : 'rgba(71, 85, 105, 0.3)'
                        }`,
                        background: isActive 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : isCompleted 
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(30, 41, 59, 0.5)',
                        transition: 'all 0.5s ease',
                        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
                        boxShadow: isActive 
                          ? '0 0 30px rgba(59, 130, 246, 0.3)' 
                          : isCompleted 
                            ? '0 0 20px rgba(34, 197, 94, 0.2)'
                            : '0 4px 15px rgba(0, 0, 0, 0.2)'
                      }}
                      className="hover-lift"
                    >
                      <div style={{
                        width: isMobile ? '50px' : '60px',
                        height: isMobile ? '50px' : '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive 
                          ? `linear-gradient(135deg, ${step.color}, #ffffff)` 
                          : isCompleted 
                            ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                            : 'rgba(71, 85, 105, 0.5)',
                        color: isActive || isCompleted ? 'white' : '#94a3b8',
                        animation: isActive ? 'glow 2s ease-in-out infinite' : 'none',
                        boxShadow: isActive 
                          ? `0 0 25px ${step.color}` 
                          : isCompleted 
                            ? '0 0 20px #22c55e'
                            : 'none'
                      }}>
                        <Icon size={isMobile ? 20 : 24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          fontWeight: '600', 
                          color: isActive ? 'white' : isCompleted ? '#f1f5f9' : '#cbd5e1',
                          margin: 0,
                          marginBottom: '8px',
                          fontSize: isMobile ? '14px' : '16px'
                        }}>
                          {step.text}
                        </p>
                        {isActive && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                  width: isMobile ? '8px' : '10px',
                                  height: isMobile ? '8px' : '10px',
                                  background: '#60a5fa',
                                  borderRadius: '50%',
                                  animation: 'bounce 1.4s ease-in-out infinite',
                                  animationDelay: `${i * 0.16}s`
                                }}></div>
                              ))}
                            </div>
                            <span style={{ 
                              fontSize: isMobile ? '12px' : '14px', 
                              color: '#60a5fa', 
                              fontWeight: '500'
                            }}>
                              Processing...
                            </span>
                          </div>
                        )}
                        {isCompleted && !isActive && (
                          <p style={{ 
                            fontSize: isMobile ? '12px' : '14px', 
                            color: '#22c55e', 
                            margin: 0,
                            fontWeight: '500'
                          }}>
                            ✓ Completed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terminal */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '16px',
                padding: isMobile ? '18px' : '25px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: isMobile ? '12px' : '14px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '15px',
                  color: '#22c55e'
                }}>
                  <div style={{
                    width: isMobile ? '12px' : '16px',
                    height: isMobile ? '12px' : '16px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    animation: 'pulse 2s ease-in-out infinite',
                    boxShadow: '0 0 10px #22c55e'
                  }}></div>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: isMobile ? '14px' : '16px' 
                  }}>
                    AuditSmartAI Terminal
                  </span>
                </div>
                <div style={{ 
                  color: '#e2e8f0', 
                  lineHeight: '1.6',
                  overflowX: 'auto'
                }}>
                  <p style={{ color: '#60a5fa', margin: '6px 0' }}>$ Initializing audit engine...</p>
                  <p style={{ color: '#22c55e', margin: '6px 0' }}>✓ Connected to blockchain network</p>
                  <p style={{ color: '#f59e0b', margin: '6px 0' }}>⚡ Analyzing contract bytecode...</p>
                  <p style={{ color: '#8b5cf6', margin: '6px 0' }}>🔍 Running vulnerability detection...</p>
                  <p style={{ color: '#ec4899', margin: '6px 0' }}>🛡️ Checking security patterns...</p>
                  <p style={{ 
                    color: '#06b6d4', 
                    margin: '6px 0',
                    animation: 'pulse 2s ease-in-out infinite',
                    fontWeight: '600'
                  }}>
                    ► Current: {steps[currentStep]?.text}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Coming Soon Message */
            <div style={{
              textAlign: 'center',
              animation: 'fadeIn 1s ease-out forwards',
              padding: isMobile ? '0 15px' : '0'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '100px' : '130px',
                height: isMobile ? '100px' : '130px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                marginBottom: isMobile ? '30px' : '40px',
                animation: 'float 6s ease-in-out infinite',
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.5)'
              }}>
                <Lock size={isMobile ? 40 : 60} color="white" />
              </div>
              
              <h1 style={{
                fontSize: isMobile ? '36px' : '64px',
                fontWeight: '800',
                margin: '0 0 20px 0',
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(96, 165, 250, 0.3)',
                lineHeight: 1.2
              }}>
                Stay Tuned!
              </h1>
              
              <p style={{
                fontSize: isMobile ? '16px' : '22px',
                color: '#cbd5e1',
                marginBottom: '40px',
                maxWidth: '600px',
                margin: '0 auto 40px auto',
                lineHeight: 1.6,
                fontWeight: '400'
              }}>
                Our AI-powered smart contract audit platform is getting the final touches. 
                We're preparing something revolutionary for the blockchain security space.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: isMobile ? '20px' : '30px',
                marginBottom: isMobile ? '40px' : '60px',
                maxWidth: '900px',
                margin: '0 auto 40px auto'
              }}>
                {[
                  { icon: Zap, title: "Lightning Fast", desc: "Get comprehensive audit reports in minutes, not days", color: "#f59e0b" },
                  { icon: Shield, title: "Advanced AI", desc: "Powered by cutting-edge AI trained on millions of contracts", color: "#60a5fa" },
                  { icon: FileText, title: "Detailed Reports", desc: "Professional-grade security analysis and recommendations", color: "#22c55e" }
                ].map((feature, index) => (
                  <div key={index} style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: isMobile ? '25px' : '35px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }} className="hover-lift glass-card">
                    <feature.icon size={isMobile ? 30 : 40} color={feature.color} style={{ 
                      margin: '0 auto 15px auto', 
                      animation: index === 1 ? 'glow 3s ease-in-out infinite' : 'pulse 2s ease-in-out infinite',
                      filter: `drop-shadow(0 0 10px ${feature.color})`
                    }} />
                    <h3 style={{ 
                      fontSize: isMobile ? '18px' : '20px', 
                      fontWeight: '700', 
                      color: 'white', 
                      margin: '0 0 12px 0' 
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: isMobile ? '14px' : '15px', 
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: isMobile ? '40px' : '50px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '12px', 
                  color: '#94a3b8',
                  marginBottom: isMobile ? '20px' : '30px',
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  <Clock size={isMobile ? 20 : 24} />
                  <span>Launching very soon...</span>
                </div>
                
                {isSubscribed ? (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '30px',
                    maxWidth: '500px',
                    margin: '0 auto 30px auto',
                    animation: 'fadeIn 0.5s ease-out'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      color: '#22c55e',
                      marginBottom: '10px'
                    }}>
                      <CheckCircle size={24} />
                      <h3 style={{ 
                        fontSize: isMobile ? '16px' : '18px', 
                        fontWeight: '600', 
                        margin: 0 
                      }}>
                        You're on the list!
                      </h3>
                    </div>
                    <p style={{ 
                      color: '#86efac', 
                      fontSize: isMobile ? '14px' : '15px', 
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      We'll notify you as soon as we launch. Thank you for your interest!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} style={{
                    maxWidth: '500px',
                    margin: '0 auto 30px auto',
                    textAlign: 'left'
                  }}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#e2e8f0',
                        fontWeight: '500',
                        fontSize: isMobile ? '14px' : '15px'
                      }}>
                        Email Address
                      </label>
                      <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '15px'
                      }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <div style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8'
                          }}>
                            <Mail size={20} />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="your@email.com"
                            style={{
                              width: '100%',
                              padding: isMobile ? '14px 14px 14px 42px' : '16px 16px 16px 48px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: `2px solid ${isEmailValid ? 'rgba(255, 255, 255, 0.2)' : 'rgba(239, 68, 68, 0.5)'}`,
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: isMobile ? '14px' : '16px',
                              fontFamily: 'inherit',
                              transition: 'all 0.3s ease',
                              outline: 'none'
                            }}
                            className="hover-lift"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          style={{
                            padding: isMobile ? '14px 20px' : '16px 30px',
                            background: isSubmitting 
                              ? 'rgba(59, 130, 246, 0.7)' 
                              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: 'white',
                            fontWeight: '700',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: isMobile ? '14px' : '16px',
                            transition: 'all 0.3s ease',
                            fontFamily: 'inherit',
                            width: isMobile ? '100%' : 'auto',
                            whiteSpace: 'nowrap',
                            opacity: isSubmitting ? 0.8 : 1
                          }}
                          className={isSubmitting ? '' : "hover-lift"}
                        >
                          {isSubmitting ? 'Submitting...' : 'Get Notified'}
                        </button>
                      </div>
                      {!isEmailValid && email.length > 0 && (
                        <p style={{ 
                          color: '#ef4444', 
                          fontSize: '13px', 
                          margin: '8px 0 0 0',
                          fontWeight: '500'
                        }}>
                          Please enter a valid email address
                        </p>
                      )}
                    </div>
                  </form>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <button 
                    onClick={goBack}
                    style={{
                      padding: isMobile ? '14px 20px' : '16px 40px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: '600',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '14px' : '16px',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      width: isMobile ? '100%' : 'auto',
                      maxWidth: '300px'
                    }}
                    className="hover-lift"
                  >
                    Back to Home
                  </button>
                </div>
              </div>

              {/* Partnership Banner */}
              <div style={{
                padding: isMobile ? '20px' : '30px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
                borderRadius: '20px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
                margin: '0 auto',
                maxWidth: '600px'
              }}>
                <p style={{ 
                  color: '#c084fc', 
                  fontWeight: '600', 
                  margin: '0 0 10px 0',
                  fontSize: isMobile ? '16px' : '18px'
                }}>
                  ⚡ Powered by <span style={{ color: 'white', fontWeight: 'bold' }}>LayerOneX</span> × <span style={{ color: 'white', fontWeight: 'bold' }}>AuditSmartAI</span>
                </p>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: isMobile ? '14px' : '16px', 
                  margin: 0,
                  fontWeight: '400'
                }}>
                  The future of smart contract security is coming
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}