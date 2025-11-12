import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogSection.css';

const BlogSection = () => {
    const navigate = useNavigate();

    const handleBlogClick = () => {
        navigate('/asa-tokenomics');
    };
    
    return (
        <section className="blog-section">
            <div className="blog-container">
                <div className="blog-content">
                    <div className="blog-icon">
                        <svg viewBox="0 0 24 24" fill="none" className="blog-svg">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h2 className="blog-title">
                        Dive Deep Into <span className="gradient-text">Smart Contract Security</span>
                    </h2>

                    <p className="blog-description">
                        🚀 Unlock exclusive insights, tutorials, and industry secrets from our experts.
                        Discover cutting-edge security techniques, blockchain innovations, and the future of decentralized technology.
                    </p>

                    <div className="blog-features">
                        <div className="feature-item">
                            <span className="feature-icon">🔒</span>
                            <span>Security Deep Dives</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🧠</span>
                            <span>AI & Blockchain Insights</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span>Industry Trends</span>
                        </div>
                    </div>

                    <button
                        className="explore-blog-btn"
                        onClick={handleBlogClick}
                    >
                        <span className="btn-text">Explore Our Blog</span>
                        <span className="btn-arrow">→</span>
                        <div className="btn-glow"></div>
                    </button>
                </div>

                <div className="blog-visual">
                    <div className="floating-elements">
                        <div className="element element-1">📚</div>
                        <div className="element element-2">🔍</div>
                        <div className="element element-3">💡</div>
                        <div className="element element-4">🚀</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogSection;