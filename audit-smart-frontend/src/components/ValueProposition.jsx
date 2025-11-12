import './ValueProposition.css';

export default function ValueProposition() {
    const features = [
        {
            image: '/One Click.png',
            title: "One-Click Audits",
            description: "Upload your Solidity contract and get instant results with comprehensive vulnerability detection."
        },
        {
            image: '/AI power.png',
            title: "AI-Powered Fixes",
            description: "Get corrected code suggestions with explanations, not just problem identification."
        },
        {
            image: '/Report.png',
            title: "Detailed Reports",
            description: "Human-readable markdown reports with severity ratings and remediation guidance."
        },
        {
            image: '/Assure.png',
            title: "Developer-First",
            description: "No vendor lock-in. Download, verify, and build with confidence in your secure code."
        }
    ];

    return (
        <section className="value-props">
            <div className='value-main-cont'>
                <span className="features-label">FEATURES</span>
                <h2 className="phase2-title">The Next Generation of Smart Contract Security</h2>
                <p className="phase2-subtitle">Advanced tools designed for blockchain developers to build with confidence</p>
            </div>
            
            <div className="strict-grid">
                {features.map((feature, index) => (
                    <div key={index} className="portrait-card">
                        <div className="image-container">
                            <img 
                                src={feature.image} 
                                alt={feature.title} 
                                className="feature-image"
                                loading="lazy"
                            />
                        </div>
                        <div className="card-content">
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}