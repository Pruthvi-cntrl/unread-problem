import { useRef, useState } from 'react'

export function ChatInput({
  rawText,
  onTextChange,
  onAnalyze,
  onClear,
  onLoadPreset,
  presets,
  isAnalyzing,
  messageCount,
  participantCount,
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        onTextChange(content)
      }
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result
        if (typeof content === 'string') {
          onTextChange(content)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <section className="chat-input-panel" aria-label="Conversation Input Panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h2 className="panel-title">Conversation Input</h2>
          <span className="panel-tag">Raw Transcript</span>
        </div>
        <div className="preset-selector-group">
          <span className="preset-label">Load Demo:</span>
          <div className="preset-buttons" role="group" aria-label="Demo scenarios">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="preset-btn"
                onClick={() => onLoadPreset(preset)}
                title={preset.description}
              >
                {preset.badge}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`textarea-wrapper ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor="chat-textarea" className="visually-hidden">
          Paste or drop chat conversation transcript
        </label>
        <textarea
          id="chat-textarea"
          className="chat-textarea"
          rows={10}
          value={rawText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Paste your chat messages here (from Slack, Teams, Discord, WhatsApp, or raw text)...

Example format:
[10:15 AM] Alice: We must fix the checkout outage immediately.
[10:16 AM] Bob: Agreed. Sarah, please rollback the deployment by 11 AM.
[10:18 AM] Sarah: I will rollback now. Who authorized the database script?`}
          spellCheck={false}
        />
        {isDragging && (
          <div className="drag-overlay" aria-hidden="true">
            <span>Drop chat transcript file here (.txt, .log)</span>
          </div>
        )}
      </div>

      <div className="input-toolbar">
        <div className="input-stats">
          <span className="stat-pill">
            <strong>{rawText.length}</strong> chars
          </span>
          <span className="stat-pill">
            <strong>{messageCount}</strong> messages
          </span>
          <span className="stat-pill">
            <strong>{participantCount}</strong> speakers
          </span>
        </div>

        <div className="input-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.log,.text"
            style={{ display: 'none' }}
            aria-label="Upload text file"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Upload .txt or .log export file"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import File
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClear}
            disabled={!rawText}
            title="Wipe conversation state and clear memory"
          >
            Clear All
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onAnalyze}
            disabled={!rawText.trim() || isAnalyzing}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Chat'}
          </button>
        </div>
      </div>
    </section>
  )
}
