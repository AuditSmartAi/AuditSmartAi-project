import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Audit from './pages/Audit';
import SampleReport from './pages/SampleReport';
import GradientCursor from './components/GradientCursor';
import Preloader from './components/Preloader';
import './styles/main.css';
import './styles/animations.css';
import DummyAuditPage from './pages/DummyAuditPage';
import ASATokenomicsBlog from './components/ASAtokenomicsblog';
import NotFound from './pages/NotFound';
import TermsAndConditions from './components/TermsAndConditions';

function AppContent() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    // Initialize scroll effects
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-effect');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.85) {
          element.classList.add('animate');
        }
      });
    };

    // Initial page load
    const initialLoadTimer = setTimeout(() => {
      setIsLoading(false);
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }, 3000);

    return () => {
      clearTimeout(initialLoadTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Handle route changes
    if (location.pathname !== currentPath) {
      setIsLoading(true);
      const navigationTimer = setTimeout(() => {
        setIsLoading(false);
        setCurrentPath(location.pathname);
      }, 1000); // Shorter duration for navigation

      return () => clearTimeout(navigationTimer);
    }
  }, [location, currentPath]);

  return (
    <>
      {isLoading && <Preloader isNavigating={currentPath !== '/'} />}
      <GradientCursor />
      <Header />
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/reports" element={<SampleReport />} />
        <Route path="/audit-v2" element={<DummyAuditPage />} />
        <Route path="/asa-tokenomics" element={<ASATokenomicsBlog />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;