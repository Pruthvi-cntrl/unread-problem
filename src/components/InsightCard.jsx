
export function InsightCard({ item, onLocateMessage, isHighlighted }) {
  const isUrgent = item.priority === 'CRITICAL' || item.priority === 'HIGH'
  const isExplicit = item.epistemicStatus === 'EXPLICIT'

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'action':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      case 'decision':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      case 'deadline':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      case 'question':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      case 'mention':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 11 19 13 23 9" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <article
      className={`insight-card priority-${item.priority.toLowerCase()} ${isHighlighted ? 'highlighted' : ''}`}
      aria-labelledby={`card-title-${item.id}`}
    >
      <div className="card-top-bar">
        <div className="card-tags">
          <span className={`category-tag tag-${item.category}`}>
            {getCategoryIcon(item.category)}
            <span>{item.category.toUpperCase()}</span>
          </span>

          <span className={`priority-tag priority-${item.priority.toLowerCase()}`}>
            {item.priority}
          </span>
        </div>

        <div className="epistemic-status">
          <span
            className={`epistemic-badge ${isExplicit ? 'explicit' : 'inferred'}`}
            title={item.epistemicReason}
          >
            <span className="dot" aria-hidden="true" />
            {isExplicit ? 'Explicitly Stated' : 'Heuristic / Inferred'}
          </span>
        </div>
      </div>

      <h3 id={`card-title-${item.id}`} className="card-title">
        {item.title}
      </h3>

      {/* Why it matters callout */}
      <div className={`why-it-matters-box ${isUrgent ? 'urgent' : ''}`}>
        <strong className="why-label">Why this matters:</strong>
        <span className="why-text">{item.whyItMatters}</span>
      </div>

      {/* Metadata fields (Assignee, Deadline) */}
      {(item.assignee || item.deadline) && (
        <div className="card-metadata-grid">
          {item.assignee && (
            <div className="metadata-item">
              <span className="meta-label">Owner:</span>
              <span
                className={`meta-value ${
                  item.assignee === 'Not specified in conversation' ? 'unspecified' : 'assigned'
                }`}
              >
                {item.assignee}
              </span>
            </div>
          )}

          {item.deadline && (
            <div className="metadata-item">
              <span className="meta-label">Deadline:</span>
              <span
                className={`meta-value ${
                  item.deadline === 'None specified' ? 'unspecified' : 'time-bound'
                }`}
              >
                {item.deadline}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Uncertainty rationale if inferred */}
      {!isExplicit && item.epistemicReason && (
        <div className="epistemic-reason-note">
          <span className="note-icon" aria-hidden="true">ℹ️</span>
          <span>{item.epistemicReason}</span>
        </div>
      )}

      {/* Grounded Source Quote */}
      <div className="source-quote-box">
        <blockquote className="quote-text">
          &ldquo;{item.sourceQuote}&rdquo;
        </blockquote>
        <div className="quote-footer">
          <span className="quote-author">
            — {item.speaker} {item.timestamp ? `(${item.timestamp})` : ''}
          </span>
          <button
            type="button"
            className="locate-source-btn"
            onClick={() => onLocateMessage(item.sourceMessageId)}
            title="Locate exact message in raw transcript"
          >
            Locate in Transcript ↗
          </button>
        </div>
      </div>
    </article>
  )
}
