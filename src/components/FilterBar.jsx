
export function FilterBar({
  activeCategory,
  onSelectCategory,
  counts,
  onlyUrgent,
  onToggleOnlyUrgent,
  searchQuery,
  onSearchChange,
}) {
  const tabs = [
    { id: 'all', label: 'All Insights', count: counts.all },
    { id: 'action', label: 'Action Items', count: counts.actions },
    { id: 'decision', label: 'Decisions', count: counts.decisions },
    { id: 'deadline', label: 'Deadlines', count: counts.deadlines },
    { id: 'question', label: 'Unanswered Questions', count: counts.questions },
    { id: 'mention', label: 'Mentions', count: counts.mentions },
  ]

  return (
    <div className="filter-bar" role="toolbar" aria-label="Insight filters">
      <div className="filter-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === tab.id}
            className={`filter-tab ${activeCategory === tab.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="filter-controls">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search insights or names..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Filter insights by keyword or speaker"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              ×
            </button>
          )}
        </div>

        <label className={`urgent-toggle-label ${onlyUrgent ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={onlyUrgent}
            onChange={(e) => onToggleOnlyUrgent(e.target.checked)}
            className="visually-hidden"
          />
          <span className="urgent-toggle-indicator" aria-hidden="true" />
          <span>Only Urgent ({counts.critical})</span>
        </label>
      </div>
    </div>
  )
}
