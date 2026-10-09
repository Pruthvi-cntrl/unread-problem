
export function PrivacyModal({ isOpen, onClose, onClearAll }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon" aria-hidden="true">🔒</span>
            <h2 id="privacy-modal-title" className="modal-title">Local-First Privacy Architecture</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close privacy modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="privacy-intro">
            <strong>The Unread Problem</strong> is engineered with a strict <em>local-first</em> security model. Your chat conversations, transcripts, and contact names never leave your web browser.
          </p>

          <div className="verification-card">
            <h4>🔬 How to Verify Local Network Behavior Yourself</h4>
            <ol className="verification-steps">
              <li>Open your browser&apos;s Developer Tools (<kbd>F12</kbd> or <kbd>Ctrl+Shift+I</kbd> / <kbd>Cmd+Option+I</kbd>).</li>
              <li>Switch to the <strong>Network</strong> tab.</li>
              <li>Check the <strong>Fetch/XHR</strong> filter to monitor data requests.</li>
              <li>Paste any conversation into the input box and click <strong>Analyze Chat</strong>.</li>
              <li>Observe that <strong>0 requests</strong> are initiated during analysis. All parsing, categorization, and ranking execute in browser memory.</li>
            </ol>
          </div>

          <div className="privacy-guarantees-grid">
            <div className="guarantee-item">
              <strong>🚫 Zero Cloud Transmission</strong>
              <span>No conversation text is dispatched to external LLMs, backend servers, or analytics.</span>
            </div>
            <div className="guarantee-item">
              <strong>🔏 Epistemic Grounding</strong>
              <span>Extractor anchors insights to exact verbatim lines rather than hallucinating details.</span>
            </div>
            <div className="guarantee-item">
              <strong>🧹 One-Click Memory Wipe</strong>
              <span>Clicking &ldquo;Clear All Data&rdquo; immediately scrubs all conversation state from memory.</span>
            </div>
            <div className="guarantee-item">
              <strong>📦 Fully Self-Contained</strong>
              <span>No external CDN scripts, tracking pixels, or third-party web font calls are loaded.</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onClearAll()
              onClose()
            }}
          >
            Wipe Memory & Clear
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
