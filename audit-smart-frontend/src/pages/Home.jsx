import { useState, useEffect, useRef } from 'react';
import ValueProposition from '../components/ValueProposition';
import WorkflowSteps from '../components/WorkflowSteps';
import Phase2Teaser from '../components/Phase2Teaser';
// import ASTLaunchSection from '../components/ASTLaunchSection';
import BlogSection from '../components/BlogSection'; // Import the new BlogSection
import './Home.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrambleText, setScrambleText] = useState(false);
  const heroTextRef = useRef(null);
  const subtitleRef = useRef(null);
  const gradientRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    // Create galaxy particles
    const createParticles = () => {
      if (particlesRef.current) {
        const particleCount = 300;
        const particlesContainer = particlesRef.current;

        // Clear existing particles
        particlesContainer.innerHTML = '';

        // Create stars
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';

          const size = Math.random() * 3 + 1;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const duration = Math.random() * 10 + 5;
          const opacity = Math.random() * 0.8 + 0.1;
          const delay = Math.random() * 10;

          particle.style.setProperty('--duration', `${duration}s`);
          particle.style.setProperty('--opacity', opacity);
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.animationDelay = `${delay}s`;

          if (Math.random() > 0.8) {
            const colors = ['#9cf4ff', '#ffd700', '#ff7b54', '#6e45e2'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 ${size * 2}px ${size}px ${color}`;
          }

          particlesContainer.appendChild(particle);
        }

        // Create shooting stars
        for (let i = 0; i < 5; i++) {
          const shootingStar = document.createElement('div');
          shootingStar.className = 'shooting-star';

          const size = Math.random() * 2 + 1;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const duration = Math.random() * 5 + 3;
          const delay = Math.random() * 15;
          const angle = Math.random() * 360;

          shootingStar.style.width = `${size}px`;
          shootingStar.style.height = `${size}px`;
          shootingStar.style.left = `${posX}%`;
          shootingStar.style.top = `${posY}%`;
          shootingStar.style.animationDuration = `${duration}s`;
          shootingStar.style.animationDelay = `${delay}s`;
          shootingStar.style.transform = `rotate(${angle}deg)`;

          particlesContainer.appendChild(shootingStar);
        }
      }
    };

    // Animate nebula background safely
    const animateNebula = () => {
      if (!gradientRef.current) return;
      let angle = 0;
      const speed = 0.1;

      const updateNebula = () => {
        if (gradientRef.current) {
          angle = (angle + speed) % 360;
          gradientRef.current.style.background = `
            radial-gradient(ellipse at bottom, 
              #0f0c29 0%, 
              #000000 100%)`;
        }
        animationFrameId = requestAnimationFrame(updateNebula);
      };

      updateNebula();
    };

    const timer = setTimeout(() => {
      setIsLoading(false);
      animateNebula();
      createParticles();

      setTimeout(() => {
        setScrambleText(true);
        setTimeout(() => {
          setScrambleText(false);
        }, 2000);
      }, 1500);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrambleTextEffect = (originalText) => {
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    let output = "";

    for (let i = 0; i < originalText.length; i++) {
      if (Math.random() > 0.7) {
        output += chars[Math.floor(Math.random() * chars.length)];
      } else {
        output += originalText[i];
      }
    }

    return output;
  };

  return (
    <main className="home-container">
      <div className="gradient-bg" ref={gradientRef}></div>
      <div className="particles" ref={particlesRef}></div>
      <div className="nebula-overlay"></div>

      

      <section className="hero">
        <div className="hero-content">
          <div
            className={`hero-text ${isLoading ? 'cinematic-load' : ''} ${scrambleText ? 'scrambling' : ''}`}
            ref={heroTextRef}
            style={
              !isLoading
                ? {
                  animation: 'cinematicReveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                }
                : {}
            }
          >
            <h1 data-original="One-Click Smart Contract Audits">
              {scrambleText ? scrambleTextEffect("One-Click Smart Contract Audits") : (
                <>
                  <span className="gradient-stroke">One-Click</span> Smart Contract Audits
                </>
              )}
            </h1>
            <p
              className="subtitle"
              ref={subtitleRef}
              data-original="AI-powered security analysis for Solidity contracts"
              style={
                !isLoading
                  ? {
                    animation: 'cinematicReveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards',
                  }
                  : {}
              }
            >
              {scrambleText
                ? scrambleTextEffect("AI-powered security analysis for Solidity contracts")
                : "AI-powered security analysis for Solidity contracts"}
            </p>
          </div>
          <div className="cta-container">
            <button className="primary-btn" onClick={() => navigate('/audit')}>
              Start Free Audit
            </button>
            <button className="secondary-btn" onClick={() => navigate('/reports')}>
              See Sample Report
            </button>
          </div>
        </div>
      </section>

      {/* Partnership Footer Banner */}
      <section className="partnership-banner">
        <div className="banner-bg"></div>
        <div className="banner-content">
          <div className="partnership-text">
            <span className="powered-label">⚡ POWERED BY</span>
            <div className="brands-container">
              <span className="brand-name layer">LayerOneX</span>
              <div className="multiplier">✕</div>
              <span className="brand-name audit">AuditSmartAI</span>
            </div>
            <span className="tagline">The Future of Smart Contract Security</span>
          </div>
        </div>
      </section>

      <section className="video-section">
        <h2 className="video-heading">Discover AuditSmartAI</h2>
        <p className="video-subtitle">See our platform in action</p>
        <div className="video-container">
          <video
            src="/ASA-AD.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="startup-video"
          />
        </div>
      </section>

      <section className="section-wrapper">
        <ValueProposition />
      </section>

      <section className="marquee-container">
        <div className="marquee-text">
          🤝 We're excited to announce our collaboration with Layer One X to power the future of smart contract audits through AuditSmartAI!
        </div>
      </section>

      <section className="section-wrapper">
        <WorkflowSteps />
      </section>

      {/* New AST Launch Section
      <section className="section-wrapper">
        <ASTLaunchSection />
      </section> */}

      {/* Blog Section */}
      <section className="section-wrapper">
        <BlogSection />
      </section>

      <section className="marquee-container">
        <div className="marquee-text">
          🚀 Phase 2 coming soon with advanced features and multi-chain support!
        </div>
      </section>

      <section className="section-wrapper">
        <Phase2Teaser />
      </section>
    </main>
  );
}