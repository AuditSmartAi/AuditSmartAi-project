import React, { useEffect, useState } from 'react';
import './SampleReport.css';

const FeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Normalize keys and load data
  useEffect(() => {
    fetch('https://opensheet.vercel.app/11E7Haa-REGuxxDshtHN5Sz4b8Y2E1Df5Z6-J9r99RoQ/Sheet1')
      .then(res => res.json())
      .then(rawData => {
        const cleanedData = rawData.map(entry => {
          const cleaned = {};
          for (let key in entry) {
            cleaned[key.trim()] = entry[key];
          }
          return cleaned;
        });
        setFeedbacks(cleanedData.reverse());
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load feedback:', err);
        setLoading(false);
      });
  }, []);

  // Parse "13/06/2025 19:37:49" → Date
  const parseTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const parts = timestamp.split(' ');
    if (parts.length !== 2) return null;

    const [datePart, timePart] = parts;
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  // Format parsed Date to display
  const formatDate = (timestamp) => {
    const date = parseTimestamp(timestamp);
    if (!date) return 'Invalid date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingClass = (rating) => {
    const num = parseInt(rating);
    if (isNaN(num)) return 'rating-color-neutral';
    if (num >= 4) return 'rating-color-good';
    if (num >= 3) return 'rating-color-okay';
    return 'rating-color-poor';
  };

  const getRatingBgClass = (rating) => {
    const num = parseInt(rating);
    if (isNaN(num)) return 'rating-bg-neutral';
    if (num >= 4) return 'rating-bg-good';
    if (num >= 3) return 'rating-bg-okay';
    return 'rating-bg-poor';
  };

  // Pagination logic
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedbacks = feedbacks.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const RatingBadge = ({ label, value, icon }) => (
    <div className={`rating-badge ${getRatingBgClass(value)}`}>
      <div className="rating-badge-content">
        <span className="rating-icon">{icon}</span>
        <span className="rating-label">{label}</span>
      </div>
      <span className={`rating-value ${getRatingClass(value)}`}>
        {value || '—'}
      </span>
    </div>
  );

  const PaginationButton = ({ page, isActive, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`pagination-button ${isActive ? 'active' : ''}`}
    >
      {page}
    </button>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">🌙 Feedback Dashboard</h1>
          <p className="dashboard-subtitle">Real-time user feedback and ratings</p>
          <div className="dashboard-stats">
            <div className="stat-item">
              <div className="stat-dot stat-dot-green"></div>
              <span>{feedbacks.length} total responses</span>
            </div>
            <div className="stat-item">
              <div className="stat-dot stat-dot-blue"></div>
              <span>Live updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {feedbacks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌙</div>
            <p className="empty-title">No feedback yet</p>
            <p className="empty-subtitle">Check back later for user responses</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="dashboard-controls">
              <div className="controls-left">
                <span className="control-label">Items per page:</span>
                <select
                  className="control-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 15, 20].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="page-info">
                Showing {startIndex + 1}-{Math.min(endIndex, feedbacks.length)} of {feedbacks.length} feedbacks
              </div>
            </div>

            {/* Cards */}
            <div className="feedback-grid">
              {currentFeedbacks.map((item, index) => (
                <div
                  key={startIndex + index}
                  className="feedback-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-header">
                    <div className="card-header-content">
                      <div className="card-header-left">
                        <div className="card-number">
                          <span className="card-number-text">
                            #{feedbacks.length - (startIndex + index)}
                          </span>
                        </div>
                        <span className="card-title">Feedback</span>
                      </div>
                      <div className="card-time">
                        🕒 {formatDate(item['Timestamp'])}
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <RatingBadge label="Code Quality" value={item['Code Quality']} icon="🧠" />
                    <RatingBadge label="Audit Accuracy" value={item['Audit Accuracy']} icon="🔍" />
                    <RatingBadge label="Deployment" value={item['Deployment Experience']} icon="🚀" />
                    <RatingBadge label="Minting" value={item['Minting Experience']} icon="🎯" />
                    <RatingBadge label="Service" value={item['Service']} icon="🛠️" />

                    <div className="overall-rating">
                      <div className="overall-content">
                        <div className="overall-left">
                          <span style={{ fontSize: '20px' }}>⭐</span>
                          <span className="overall-title">Overall Rating</span>
                        </div>
                        <div className="overall-value">
                          <span className={`overall-score ${getRatingClass(item['Overall'])}`}>
                            {item['Overall'] || '—'}
                          </span>
                          {item['Overall'] && <span className="overall-max">/5</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.Comments && item.Comments.toLowerCase() !== 'no comments' && (
                    <div className="comments-section">
                      <div className="comments-box">
                        <div className="comments-header">
                          <span className="comments-icon">💬</span>
                          <div>
                            <p className="comments-label">Comments</p>
                            <p className="comments-text">"{item.Comments}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <PaginationButton
                  page="‹"
                  isActive={false}
                  disabled={currentPage === 1}
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationButton
                    key={page}
                    page={page}
                    isActive={page === currentPage}
                    onClick={() => goToPage(page)}
                  />
                ))}
                <PaginationButton
                  page="›"
                  isActive={false}
                  disabled={currentPage === totalPages}
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                />
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackDashboard;
