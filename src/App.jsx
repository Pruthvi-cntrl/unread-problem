import { useState, useMemo, useCallback } from 'react'
import { parseChat, getParticipants } from './utils/chatParser'
import { analyzeConversation } from './utils/nlpExtractor'
import { SAMPLE_CONVERSATIONS } from './utils/sampleData'
import { generateMarkdownBriefing } from './utils/exportMarkdown'
import { Header } from './components/Header'
import { ChatInput } from './components/ChatInput'
import { ExecutiveSummary } from './components/ExecutiveSummary'
import { FilterBar } from './components/FilterBar'
import { InsightCard } from './components/InsightCard'
import { MessageViewer } from './components/MessageViewer'
import { PrivacyModal } from './components/PrivacyModal'
import './App.css'

export default function App() {
  // Initialize synchronously with the first demo scenario so judges see immediate value on initial load
  const [rawText, setRawText] = useState(SAMPLE_CONVERSATIONS[0].text)
  const [messages, setMessages] = useState(() => parseChat(SAMPLE_CONVERSATIONS[0].text))
  const [analysis, setAnalysis] = useState(() => {
    const initialParsed = parseChat(SAMPLE_CONVERSATIONS[0].text)
    const participants = getParticipants(initialParsed)
    return analyzeConversation(initialParsed, participants)
  })
  const [activeCategory, setActiveCategory] = useState('all')
  const [onlyUrgent, setOnlyUrgent] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedMessageId, setHighlightedMessageId] = useState(null)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)

  // Core analysis runner
  const performAnalysis = useCallback((textToAnalyze) => {
    if (!textToAnalyze || !textToAnalyze.trim()) {
      setMessages([])
      setAnalysis(null)
      setHighlightedMessageId(null)
      return
    }

    const parsedMessages = parseChat(textToAnalyze)
    const participants = getParticipants(parsedMessages)
    const result = analyzeConversation(parsedMessages, participants)

    setMessages(parsedMessages)
    setAnalysis(result)
    setHighlightedMessageId(null)
  }, [])

  // Handlers
  const handleAnalyze = () => {
    performAnalysis(rawText)
  }

  const handleClearAll = () => {
    setRawText('')
    setMessages([])
    setAnalysis(null)
    setHighlightedMessageId(null)
    setSearchQuery('')
  }

  const handleLoadPreset = (preset) => {
    setRawText(preset.text)
    performAnalysis(preset.text)
    setActiveCategory('all')
    setOnlyUrgent(false)
    setSearchQuery('')
  }

  const handleLocateMessage = (msgId) => {
    setHighlightedMessageId(msgId)
  }

  const handleCopyMarkdown = () => {
    if (!analysis) return
    const md = generateMarkdownBriefing(
      analysis.summary,
      analysis.actions,
      analysis.decisions,
      analysis.deadlines,
      analysis.questions
    )
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        setCopiedMarkdown(true)
        setTimeout(() => setCopiedMarkdown(false), 2200)
      })
    }
  }

  // Filtered insights based on active category, urgency toggle, and search query
  const filteredInsights = useMemo(() => {
    if (!analysis || !analysis.allInsights) return []

    let list = analysis.allInsights

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory)
    }

    // Urgency filter
    if (onlyUrgent) {
      list = list.filter((item) => item.priority === 'CRITICAL' || item.priority === 'HIGH')
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.whyItMatters.toLowerCase().includes(q) ||
          item.sourceQuote.toLowerCase().includes(q) ||
          item.speaker.toLowerCase().includes(q) ||
          (item.assignee && item.assignee.toLowerCase().includes(q))
      )
    }

    return list
  }, [analysis, activeCategory, onlyUrgent, searchQuery])

  const counts = analysis?.counts || {
    all: 0,
    actions: 0,
    decisions: 0,
    deadlines: 0,
    mentions: 0,
    questions: 0,
    critical: 0,
  }

  return (
    <div className="app-container">
      <Header onShowPrivacy={() => setIsPrivacyModalOpen(true)} />

      <main className="app-main">
        {/* Top Section: Conversation Input */}
        <ChatInput
          rawText={rawText}
          onTextChange={setRawText}
          onAnalyze={handleAnalyze}
          onClear={handleClearAll}
          onLoadPreset={handleLoadPreset}
          presets={SAMPLE_CONVERSATIONS}
          isAnalyzing={false}
          messageCount={messages.length}
          participantCount={getParticipants(messages).length}
        />

        {/* Dashboard Section */}
        {analysis && (
          <section className="dashboard-section" aria-label="Analysis Dashboard">
            {/* Executive Summary TL;DR */}
            <ExecutiveSummary
              summary={analysis.summary}
              onLocateMessage={handleLocateMessage}
              onCopyMarkdown={handleCopyMarkdown}
              copiedMarkdown={copiedMarkdown}
            />

            {/* Dual Column: Insights Feed + Transcript Inspector */}
            <div className="dashboard-grid">
              {/* Left Column: Filterable Insight Cards */}
              <div className="insights-column">
                <div className="column-header">
                  <h2 className="column-title">Extracted Insights & Prioritization</h2>
                  <span className="insight-count-pill">{filteredInsights.length} items</span>
                </div>

                <FilterBar
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  counts={counts}
                  onlyUrgent={onlyUrgent}
                  onToggleOnlyUrgent={setOnlyUrgent}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                <div className="insight-cards-list">
                  {filteredInsights.length === 0 ? (
                    <div className="no-insights-found">
                      <p>No insights match the current filter or search criteria.</p>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setActiveCategory('all')
                          setOnlyUrgent(false)
                          setSearchQuery('')
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredInsights.map((item) => (
                      <InsightCard
                        key={item.id}
                        item={item}
                        onLocateMessage={handleLocateMessage}
                        isHighlighted={item.sourceMessageId === highlightedMessageId}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Source Transcript Inspector */}
              <div className="transcript-column">
                <MessageViewer
                  messages={messages}
                  highlightedMessageId={highlightedMessageId}
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>The Unread Problem &mdash; Hackathon Edition</span>
          <button
            type="button"
            className="footer-privacy-link"
            onClick={() => setIsPrivacyModalOpen(true)}
          >
            🛡️ Privacy & Verification Guide
          </button>
        </div>
      </footer>

      {/* Privacy modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
