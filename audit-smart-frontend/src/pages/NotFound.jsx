import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function NotFound() {
  const navigate = useNavigate();
  const particlesRef = useRef(null);
  const [errorType, setErrorType] = useState(0);
  const [alienClicked, setAlienClicked] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const errorMessages = [
    "ALIEN INTERVENTION DETECTED",
    "WORMHOLE DIVERSION ERROR",
    "SPACE-TIME COORDINATES INVALID",
    "404: PAGE NOT FOUND IN THIS DIMENSION",
    "INTERGALACTIC INTERNET DOWN",
    "THE DARK SIDE BLOCKED THIS PATH",
    "MIDICHLORIANS DISRUPTED THE SIGNAL",
    "THIS ISN'T THE PAGE YOU'RE LOOKING FOR 👋"
  ];

  const funnySolutions = [
    "• Try sacrificing a keyboard to the tech gods",
    "• Blame the intern (even if you don't have one)",
    "• Turn it off and on... the universe, that is",
    "• Check if your cat walked on the router again",
    "• Wait for Elon Musk to colonize this URL",
    "• Offer coffee to your developer (that's you!)",
    "• Convince the page it's in your best interest to load",
    "• Pretend this was an intentional art installation"
  ];

  useEffect(() => {
    // Rotate through funny error messages
    const errorInterval = setInterval(() => {
      setErrorType(prev => (prev + 1) % errorMessages.length);
    }, 3000);

    // Create special 404 particles
    if (particlesRef.current) {
      particlesRef.current.innerHTML = '';
      
      // Add floating emojis
      const emojis = ['👾', '🛸', '👽', '☄️', '🌌', '🚀', '🤖', '💫'];
      for (let i = 0; i < 20; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji-particle';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = `${Math.random() * 100}%`;
        emoji.style.top = `${Math.random() * 100}%`;
        emoji.style.fontSize = `${Math.random() * 20 + 10}px`;
        emoji.style.animationDuration = `${Math.random() * 20 + 10}s`;
        emoji.style.animationDelay = `${Math.random() * 5}s`;
        particlesRef.current.appendChild(emoji);
      }
    }

    return () => clearInterval(errorInterval);
  }, []);

  const handleAlienClick = () => {
    setAlienClicked(true);
    setTimeout(() => setAlienClicked(false), 1000);
    setShowSecret(Math.random() > 0.7); // 30% chance to show secret
  };

  return (
    <main className="home-container not-found-page">
      <div className="gradient-bg error-gradient"></div>
      <div className="particles" ref={particlesRef}></div>
      <div className="nebula-overlay error-nebula"></div>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="error-glitch" data-text="404 ERROR">
              404 ERROR
            </h1>
            <p className="subtitle flicker">
              {errorMessages[errorType]}
            </p>
          </div>
          
          <div className="ufo-container">
            <div 
              className={`alien ${alienClicked ? 'alien-hit' : ''}`} 
              onClick={handleAlienClick}
              aria-label="Clickable alien"
            >
              👽
              {alienClicked && <div className="alien-speech">"404, DUDE!"</div>}
            </div>
            <div className="ufo">🛸</div>
            <div className="cow">🐄</div>
          </div>

          {showSecret && (
            <div className="secret-message">
              <p>SECRET DEVELOPER MESSAGE:</p>
              <p>"I totally meant to do that. It's a feature."</p>
            </div>
          )}

          <div className="cta-container">
            <button 
              className="primary-btn error-btn" 
              onClick={() => navigate('/')}
            >
              🚀 Emergency Launch
            </button>
            <button 
              className="secondary-btn error-btn-secondary" 
              onClick={() => window.history.back()}
            >
              🔙 Panic Retreat
            </button>
          </div>
        </div>
      </section>

      <div className="error-terminal">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="terminal-btn red"></span>
            <span className="terminal-btn yellow"></span>
            <span className="terminal-btn green"></span>
          </div>
          <div className="terminal-title">root@auditsmartai:~</div>
        </div>
        <div className="terminal-body">
          <p className="terminal-command">$ locate requested_page</p>
          <p className="terminal-output">ERROR: Page not found in known universe</p>
          <p className="terminal-command">$ sudo fix_404</p>
          <p className="terminal-output">
            {funnySolutions.map((sol, i) => (
              <span key={i}>{sol}<br/></span>
            ))}
          </p>
          <p className="terminal-command">$ curl why-did-this-happen</p>
          <p className="terminal-output">
            <span className="blink">▉</span> REASON: {[
              "Insufficient coffee levels",
              "Quantum fluctuation",
              "Blame the blockchain",
              "Solar flares",
              "Too many tabs open",
              "The matrix glitched",
              "You broke the internet"
            ][Math.floor(Math.random() * 7)]}
          </p>
        </div>
      </div>
    </main>
  );
}