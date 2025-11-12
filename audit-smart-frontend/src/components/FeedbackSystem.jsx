import { useState } from 'react';
import './FeedbackSystem.css';

export const FeedbackIcon = ({ onClick, hasNewResults }) => (
  <div
    className={`feedback-icon ${hasNewResults ? 'pulse' : ''}`}
    onClick={onClick}
    title="Share your feedback"
  >
    Feedback
    {hasNewResults && <span className="notification-badge"></span>}
  </div>
);

export const StarRating = ({ rating, onRatingChange, onHoverRating, type, label }) => {
  return (
    <div className="star-rating">
      <label>{label}</label>
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${rating >= star ? 'filled' : ''}`}
            onClick={() => onRatingChange(star, type)}
            onMouseEnter={() => onHoverRating(star, type)}
            onMouseLeave={() => onHoverRating(0, type)}
          >
            ★
          </span>
        ))}
        <span className="rating-value">
          {rating > 0 ? `${rating.toFixed(1)} stars` : 'Not rated'}
        </span>
      </div>
    </div>
  );
};

export const FeedbackModal = ({
  show,
  onClose,
  feedback,
  setFeedback,
  onSubmit,
  deploymentResults,
  mintingResults,
  walletAddress, // Use wallet address as primary identifier
  isSubmitting
}) => {
  const [hoverRating, setHoverRating] = useState({
    codeQuality: 0,
    service: 0,
    auditAccuracy: 0,
    deploymentExperience: 0,
    mintingExperience: 0,
    overall: 0
  });

  const handleRatingChange = (rating, type) => {
    setFeedback(prev => ({
      ...prev,
      [`${type}Rating`]: rating,
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleHoverRating = (rating, type) => {
    setHoverRating(prev => ({
      ...prev,
      [type]: rating
    }));
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!show) return null;

  return (
    <div className={`feedback-modal ${show ? 'active' : ''}`}>
      <div className="feedback-backdrop" onClick={handleBackdropClick}></div>
      <div className="feedback-content" onClick={handleContentClick}>
        <div className="feedback-header">
          <h3>How was your experience?</h3>
          {walletAddress && (
            <p className="wallet-info">Session: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          )}
          <button className="close-btn" onClick={handleClose} type="button">×</button>
        </div>

        {feedback.submitted ? (
          <div className="feedback-thank-you">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#28a745">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h4>Thank you for your feedback!</h4>
            <p>We appreciate you taking the time to help us improve our AI-powered audit service.</p>
            <button className="submit-feedback-btn" onClick={handleClose} type="button">
              Close
            </button>
          </div>
        ) : (
          <div className="feedback-form">
            <p className="feedback-subtitle">
              Please rate your experience with this audit session
            </p>

            <StarRating
              rating={hoverRating.codeQuality || feedback.codeQualityRating}
              onRatingChange={handleRatingChange}
              onHoverRating={handleHoverRating}
              type="codeQuality"
              label="Code quality improvements"
            />

            <StarRating
              rating={hoverRating.auditAccuracy || feedback.auditAccuracyRating}
              onRatingChange={handleRatingChange}
              onHoverRating={handleHoverRating}
              type="auditAccuracy"
              label="Vulnerability detection accuracy"
            />

            <StarRating
              rating={hoverRating.deploymentExperience || feedback.deploymentExperienceRating}
              onRatingChange={handleRatingChange}
              onHoverRating={handleHoverRating}
              type="deploymentExperience"
              label="Contract deployment experience"
            />

            <StarRating
              rating={hoverRating.mintingExperience || feedback.mintingExperienceRating}
              onRatingChange={handleRatingChange}
              onHoverRating={handleHoverRating}
              type="mintingExperience"
              label="NFT minting experience"
            />

            <StarRating
              rating={hoverRating.service || feedback.serviceRating}
              onRatingChange={handleRatingChange}
              onHoverRating={handleHoverRating}
              type="service"
              label="Overall service quality"
            />

            <StarRating
              rating={hoverRating.overall || feedback.overallRating}
              onRatingChange={handleRatingChange}
              onHoverRating={handleHoverRating}
              type="overall"
              label="Overall satisfaction"
            />

            <div className="feedback-item">
              <label htmlFor="comments">Additional comments</label>
              <textarea
                id="comments"
                value={feedback.comments}
                onChange={(e) => setFeedback({
                  ...feedback,
                  comments: e.target.value,
                  lastUpdated: new Date().toISOString()
                })}
                placeholder="What worked well? What could be improved?"
                rows="4"
              />
            </div>

            {feedback.error && (
              <div className="error-message">
                {feedback.error}
              </div>
            )}

            <div className="feedback-actions">
              <button
                type="button"
                className="submit-feedback-btn primary"
                onClick={onSubmit}
                disabled={feedback.overallRating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                type="button"
                className="submit-feedback-btn secondary my-maybe-later"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const useFeedbackSystem = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    codeQualityRating: 0,
    serviceRating: 0,
    auditAccuracyRating: 0,
    deploymentExperienceRating: 0,
    mintingExperienceRating: 0,
    overallRating: 0,
    comments: '',
    submitted: false,
    lastUpdated: null,
    walletAddress: null, // Primary identifier
    auditId: null, // Secondary reference
    error: null
  });
  const [pendingWalletAddress, setPendingWalletAddress] = useState(null);
  const [hasNewResults, setHasNewResults] = useState(false);

  const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwLuYx66kbs7d6vYLYalvWtmWS9rMJ1xacRBTaVZHR9kFO4KOWzNteb2Ye5HZ2dhw0s/exec";

  const handleFeedbackSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(prev => ({ ...prev, error: null }));

    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          walletAddress: feedback.walletAddress || 'Anonymous'
        })
      });

      setFeedback(prev => ({
        ...prev,
        submitted: true,
        lastUpdated: new Date().toISOString()
      }));

    } catch (err) {
      console.error('Submission Error:', err);
      setFeedback(prev => ({
        ...prev,
        error: 'Unable to submit feedback. Please try again later or contact support.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptForFeedback = (walletAddress) => {
    if (feedback.walletAddress !== walletAddress) {
      setPendingWalletAddress(walletAddress);
      setHasNewResults(true);
      setFeedback({
        codeQualityRating: 0,
        serviceRating: 0,
        auditAccuracyRating: 0,
        deploymentExperienceRating: 0,
        mintingExperienceRating: 0,
        overallRating: 0,
        comments: '',
        submitted: false,
        lastUpdated: null,
        walletAddress: walletAddress, // Only use walletAddress
        error: null
      });
    }
  };

  const openFeedback = () => {
    setShowFeedback(true);
    setHasNewResults(false);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    setHasNewResults(false);
    if (feedback.submitted) {
      setFeedback(prev => ({ ...prev, submitted: false }));
    }
  };

  return {
    showFeedback,
    setShowFeedback: openFeedback,
    closeFeedback,
    feedback,
    setFeedback,
    handleFeedbackSubmit,
    promptForFeedback,
    hasNewResults,
    pendingAuditId: pendingWalletAddress, // Return wallet address instead
    isSubmitting
  };
};