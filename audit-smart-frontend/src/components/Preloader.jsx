import { useEffect, useState } from 'react';
import './Preloader.css';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 500);
          return 100;
        }
        return prev + (1 + Math.random() * 3);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="preloader">
      <div className="preloader-content">
        <div className="logo-container">
          <div className="logo-spinner">
            <div className="logo-orbits">
              <div className="orbit orbit-1"></div>
              <div className="orbit orbit-2"></div>
              <div className="orbit orbit-3"></div>
            </div>
            <div className="logo-core"></div>
          </div>
          <h1 className="logo-text">
            <span className="gradient-text">Audit</span><span>Smart</span><span className='ai-txt'>AI</span>
          </h1>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        <p className="status-text">
          {progress < 30 && "Initializing security protocols..."}
          {progress >= 30 && progress < 70 && "Analyzing blockchain modules..."}
          {progress >= 70 && progress < 100 && "Finalizing smart contract checks..."}
          {progress === 100 && "Ready to audit!"}
        </p>
      </div>
    </div>
  );
}