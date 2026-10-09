import { useState } from 'react'

export function ExecutiveSummary({ summary, onLocateMessage, onCopyMarkdown, copiedMarkdown }) {
  const [copySuccess, setCopySuccess] = useState(false)

  if (!summary || summary.bullets.length === 0) {
    return null
  }

  const handleCopy = () => {
    onCopyMarkdown()
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2200)
  }

  return (
    <section className="executive-summary-card" aria-label="Executive Briefing">
      <div className="summary-header">
        <div className="summary-title-wrapper">
          <div className="summary-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h2 className="summary-heading">Executive Briefing (TL;DR)</h2>
            <p className="summary-subheading">High-salience conversation highlights grounded in source messages</p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm copy-btn"
          onClick={handleCopy}
          title="Copy formatted briefing to clipboard as Markdown"
        >
          {copySuccess || copiedMarkdown ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy as Markdown
            </>
          )}
        </button>
      </div>

      <div className="summary-stats-bar">
        <div className="stat-item">
          <span className="stat-label">Messages</span>
          <span className="stat-value">{summary.stats.totalMessages}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Speakers</span>
          <span className="stat-value">{summary.stats.activeSpeakers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time Span</span>
          <span className="stat-value">{summary.stats.timeSpan}</span>
        </div>
      </div>

      <ul className="summary-bullets-list">
        {summary.bullets.map((bullet, idx) => (
          <li key={idx} className={`summary-bullet bullet-type-${bullet.type}`}>
            <span className="bullet-label">{bullet.label}:</span>
            <span className="bullet-content">{bullet.text}</span>
            {bullet.sourceId && (
              <button
                type="button"
                className="bullet-source-btn"
                onClick={() => onLocateMessage(bullet.sourceId)}
                title="Locate original message in transcript"
              >
                Inspect Source ↗
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
