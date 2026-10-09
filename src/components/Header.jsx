
export function Header({ onShowPrivacy }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M12 7v3" />
            <circle cx="12" cy="14" r="0.5" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h1 className="brand-title">The Unread Problem</h1>
          <p className="brand-subtitle">What Did I Miss? — Client-Side Chat Intelligence</p>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="privacy-badge-btn"
          onClick={onShowPrivacy}
          title="Click to view local-only verification guide"
          aria-label="View local-first privacy verification"
        >
          <span className="privacy-pulse" aria-hidden="true" />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="privacy-badge-text">100% Client-Side Local</span>
        </button>
      </div>
    </header>
  )
}
