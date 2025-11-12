import React from "react";
import { Helmet } from "react-helmet";
import "./TokenomicsBlog.css";

const TokenomicsBlog = () => {
  return (
    <article className="tokenomics-article">
      <Helmet>
        <title>Audit Smart AI Tokenomics Overview</title>
        <meta
          name="description"
          content="Overview of the economic and ecosystem design principles behind Audit Smart AI."
        />
        <meta
          name="keywords"
          content="Audit Smart AI, Tokenomics, Blockchain, Ecosystem, Overview"
        />
        <meta name="author" content="Audit Smart AI Team" />
        <link rel="canonical" href="#" />
      </Helmet>

      <h1 className="main-title glow-text">
        💠 Audit Smart AI Tokenomics Overview
      </h1>

      <section className="section fade-in">
        <p className="intro-text">
          The <strong>Audit Smart AI (AST)</strong> ecosystem is structured to
          promote transparency, security, and long-term sustainability within
          decentralized auditing and analysis systems.
        </p>

        <div className="highlight-box">
          <p>
            Our economic model is designed to align incentives across
            participants, ensuring active engagement from developers,
            contributors, and users throughout the ecosystem.
          </p>
        </div>
      </section>

      <section className="section fade-in">
        <h2 className="section-title gradient-text">
          Core Economic Principles 💹
        </h2>
        <ul className="tokenomics-list">
          <li>
            <strong>Utility Driven:</strong> AST tokens are intended to
            facilitate ecosystem operations such as audits, verifications, and
            governance interactions.
          </li>
          <li>
            <strong>Community Growth:</strong> The system rewards meaningful
            contributions, encouraging collaboration and innovation.
          </li>
          <li>
            <strong>Long-Term Vision:</strong> The model emphasizes sustainable
            growth rather than short-term speculation.
          </li>
        </ul>
      </section>

      <section className="section fade-in">
        <h2 className="section-title gradient-text">
          Why Tokenomics Matter 💡
        </h2>
        <p>
          Tokenomics define how value flows within a blockchain ecosystem. They
          influence user participation, trust, and scalability — ensuring the
          system remains balanced and effective over time.
        </p>
      </section>

      <section className="section fade-in">
        <p>
          This overview highlights the foundational ideas behind Audit Smart AI’s
          economic framework, focusing on fairness, transparency, and community
          alignment.
        </p>
      </section>
    </article>
  );
};

export default TokenomicsBlog;
