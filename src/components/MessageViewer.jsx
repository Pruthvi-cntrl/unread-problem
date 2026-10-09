import { useEffect, useRef } from 'react'

export function MessageViewer({ messages, highlightedMessageId }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (highlightedMessageId && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-msg-id="${highlightedMessageId}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightedMessageId])

  if (!messages || messages.length === 0) {
    return (
      <div className="empty-messages-placeholder">
        <p>No messages parsed yet. Enter conversation text or select a demo scenario above.</p>
      </div>
    )
  }

  return (
    <section className="message-viewer-panel" aria-label="Raw Transcript Viewer">
      <div className="viewer-header">
        <h3 className="viewer-title">Transcript Inspector</h3>
        <span className="viewer-count">{messages.length} messages</span>
      </div>

      <div className="messages-stream" ref={containerRef}>
        {messages.map((msg) => {
          const isHighlighted = msg.id === highlightedMessageId
          return (
            <div
              key={msg.id}
              data-msg-id={msg.id}
              className={`message-row ${isHighlighted ? 'highlighted-source' : ''}`}
            >
              <div className="message-gutter">
                <span className="message-index">#{msg.index + 1}</span>
              </div>
              <div className="message-content-wrapper">
                <div className="message-meta">
                  <span className="message-speaker">{msg.speaker}</span>
                  {msg.timestamp && (
                    <span className="message-timestamp">{msg.timestamp}</span>
                  )}
                  {isHighlighted && (
                    <span className="source-match-badge">Selected Source</span>
                  )}
                </div>
                <div className="message-text">
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
