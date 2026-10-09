/**
 * Pure client-side chat parser.
 * Handles common chat formats (Slack, Discord, WhatsApp, Teams, and plain text)
 * without sending any data over the network.
 */

// Regex patterns for message header detection
const PATTERNS = [
  // [10:15 AM] Alice: Message or [10:15] Alice: Message or [2026-10-09 10:15] Alice: Message
  /^\[([\d/:\-\sAPMapm,]+)\]\s+([^:]+?):\s*(.*)$/,

  // Alice [10:15 AM]: Message or Alice (10:15): Message
  /^([^:[(]+?)\s*[[(]([\d/:\-\sAPMapm,]+)[\])]:\s*(.*)$/,

  // 10/09/2026, 10:15 AM - Alice: Message (WhatsApp format)
  /^([\d/:\-\sAPMapm,]+?)\s*-\s*([^:]+?):\s*(.*)$/,

  // Alice: Message (Simple format without timestamp)
  /^([A-Za-z0-9_.\s@-]{2,30}):\s*(.*)$/,
]

/**
 * Parses raw chat text into an array of structured message objects.
 *
 * @param {string} rawText
 * @returns {Array<{id: string, index: number, speaker: string, timestamp: string | null, text: string, rawLine: string}>}
 */
export function parseChat(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return []
  }

  const lines = rawText.split(/\r?\n/)
  const messages = []
  let currentMsg = null
  let messageCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      continue
    }

    let matched = false

    // Check against patterns in order
    for (let pIdx = 0; pIdx < PATTERNS.length; pIdx++) {
      const match = line.match(PATTERNS[pIdx])
      if (match) {
        let timestamp = null
        let speaker = ''
        let content = ''

        if (pIdx === 0) {
          // [time] speaker: content
          timestamp = match[1].trim()
          speaker = match[2].trim()
          content = match[3].trim()
        } else if (pIdx === 1) {
          // speaker [time]: content
          speaker = match[1].trim()
          timestamp = match[2].trim()
          content = match[3].trim()
        } else if (pIdx === 2) {
          // time - speaker: content
          timestamp = match[1].trim()
          speaker = match[2].trim()
          content = match[3].trim()
        } else if (pIdx === 3) {
          // speaker: content
          // Guard against false positives like "http://", "Note:", "Warning:"
          const testSpeaker = match[1].trim()
          if (/^(http|https|note|warning|ps|todo|eod|error|info)$/i.test(testSpeaker)) {
            continue
          }
          speaker = testSpeaker
          content = match[2].trim()
        }

        // Clean up speaker name (remove leading @ if present)
        speaker = speaker.replace(/^@/, '')

        messageCount++
        currentMsg = {
          id: `msg-${messageCount}`,
          index: messageCount - 1,
          speaker: speaker || 'Participant',
          timestamp: timestamp || null,
          text: content,
          rawLine: line,
        }
        messages.push(currentMsg)
        matched = true
        break
      }
    }

    if (!matched) {
      if (currentMsg) {
        // Multi-line continuation of previous message
        currentMsg.text = `${currentMsg.text}\n${line}`.trim()
        currentMsg.rawLine = `${currentMsg.rawLine}\n${line}`
      } else {
        // Fallback for line without header before any match
        messageCount++
        currentMsg = {
          id: `msg-${messageCount}`,
          index: messageCount - 1,
          speaker: 'Participant',
          timestamp: null,
          text: line,
          rawLine: line,
        }
        messages.push(currentMsg)
      }
    }
  }

  return messages
}

/**
 * Extracts unique participants from parsed messages.
 * @param {Array} messages
 * @returns {Array<string>}
 */
export function getParticipants(messages) {
  const set = new Set()
  messages.forEach((m) => {
    if (m.speaker && m.speaker !== 'Participant') {
      set.add(m.speaker)
    }
  })
  return Array.from(set)
}
