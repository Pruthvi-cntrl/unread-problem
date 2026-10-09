/**
 * Pure client-side NLP & Extractive Analysis Engine.
 * 100% in-browser, zero external API calls or network egress.
 *
 * Extracts:
 * - Extractive Executive Summary (TL;DR)
 * - Action Items (with assignees & verbatim source quotes)
 * - Key Decisions
 * - Deadlines & Temporal Commitments
 * - Mentions & Direct Requests
 * - Unanswered Questions (with heuristic uncertainty flag)
 * - Priority scoring with explicit "Why this matters" rationales
 * - Strict Epistemic Grounding: Explicitly Stated vs Heuristic/Inferred
 */

// Urgency keywords
const URGENT_REGEX = /\b(urgent|urgently|asap|blocker|blocking|critical|severity\s*1|sev-?1|p0|incident|broken|down|outage|emergency|immediately|deadline|eod)\b/i
const HIGH_PRIORITY_VERBS = /\b(fix|resolve|rollback|revert|deploy|hotfix|patch|escalate|halt|stop)\b/i

// Temporal & deadline patterns
const DEADLINE_REGEX = /\b(by\s+(?:today|tomorrow|eod|eow|end\s+of\s+day|morning|afternoon|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+week|\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)|due\s+(?:on|by|date)?\s*(?:today|tomorrow|eod|eow|monday|tuesday|wednesday|thursday|friday|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)|deadline\s*(?:is|:)?\s*[^.,;!?]+|before\s+(?:launch|release|meeting|standup|the\s+demo))\b/i

// Decision keywords
const DECISION_PATTERNS = [
  /\b(?:we\s+(?:have\s+)?decided|decided\s+to|let's\s+go\s+with|agreed\s+(?:to|that|on)|consensus\s+is|settled\s+on|approved|final\s+decision(?:\s*is|:)?|approved\s+to|moving\s+forward\s+with|we're\s+going\s+with|confirmed\s+that)\b/i,
  /\b(?:decision:?\s*[^.,;!?]+)/i,
]

// Action item triggers
const ACTION_PATTERNS = [
  /\b(?:action\s+item:?|todo:?|to-do:?)\s*(.*)/i,
  /\b(?:please|can\s+you|could\s+you|need\s+to|needs\s+to|must|have\s+to|make\s+sure\s+to|will\s+take\s+care\s+of|will\s+handle|i\s+will|i'll)\s+([A-Za-z0-9_.\s-]+)/i,
  /\b(?:assign(?:ed)?\s+to|take\s+a\s+look\s+at|look\s+into|investigate|deploy|implement|update|review|test|fix)\s+([A-Za-z0-9_.\s-]+)/i,
]

// Interrogative / Question indicators
const QUESTION_STARTERS = /^(who|what|when|where|why|how|can|could|is|are|do|does|did|has|have|should|would|will|any\s+update|anyone\s+know)\b/i

/**
 * Splits text into individual sentences for fine-grained analysis.
 */
function splitSentences(text) {
  if (!text) return []
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9@"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * Extracts action items from messages.
 */
function extractActionItems(messages, participants) {
  const items = []
  let count = 0

  messages.forEach((msg) => {
    const sentences = splitSentences(msg.text)
    sentences.forEach((sentence) => {
      let isAction = false
      let taskText = sentence
      let matchedAssignee = null
      let isExplicit = false

      // Check explicit action item prefix
      if (/\b(?:action\s+item|todo|to-do):?\s*/i.test(sentence)) {
        isAction = true
        taskText = sentence.replace(/^(?:action\s+item|todo|to-do):?\s*/i, '')
      } else {
        // Check imperative & modal verbs
        for (const pattern of ACTION_PATTERNS) {
          if (pattern.test(sentence)) {
            isAction = true
            break
          }
        }
      }

      if (isAction) {
        // Filter out questions (e.g. "Can you tell me why?") unless it's a polite request like "Can you review X?"
        const isQuestion = sentence.trim().endsWith('?')
        const isPoliteRequest = /\b(can\s+you|could\s+you|please)\s+(?:review|fix|check|deploy|send|update|verify|take\s+over)/i.test(sentence)
        if (isQuestion && !isPoliteRequest) {
          return
        }

        // Detect assignee
        // 1. Direct mention: @Name
        const mentionMatch = sentence.match(/@([A-Za-z0-9_.-]+)/)
        if (mentionMatch) {
          matchedAssignee = mentionMatch[1]
          isExplicit = true
        }

        // 2. Name address: "Alice, can you..." or "Alice: please..."
        if (!matchedAssignee) {
          for (const p of participants) {
            const namePattern = new RegExp(`^\\b${p}\\b[,:]?\\s+(?:please|can|could|need|must|take)`, 'i')
            if (namePattern.test(sentence)) {
              matchedAssignee = p
              isExplicit = true
              break
            }
          }
        }

        // 3. First person commitment: "I will do X", "I'll handle X"
        if (!matchedAssignee && /\b(i\s+will|i'll\s+handle|i'll\s+take|i\s+can\s+do|i'm\s+on\s+it)\b/i.test(sentence)) {
          matchedAssignee = msg.speaker
          isExplicit = true
        }

        // Determine deadline in sentence if present
        const deadlineMatch = sentence.match(DEADLINE_REGEX)
        const deadline = deadlineMatch ? deadlineMatch[0] : null

        // Urgency scoring & rationale
        let priority
        let whyItMatters

        if (URGENT_REGEX.test(sentence) || HIGH_PRIORITY_VERBS.test(sentence) || (deadline && /today|eod|now|asap/i.test(deadline))) {
          priority = 'CRITICAL'
          whyItMatters = `Contains high-urgency keywords (${sentence.match(URGENT_REGEX)?.[0] || 'time-critical'}) or requires immediate operational action.`
        } else if (!matchedAssignee) {
          priority = 'MEDIUM'
          whyItMatters = 'Action item identified but no explicit assignee was designated — risk of task being dropped.'
        } else {
          priority = 'LOW'
          whyItMatters = 'Routine follow-up task with defined context.'
        }

        count++
        items.push({
          id: `act-${count}`,
          category: 'action',
          title: taskText.length > 120 ? `${taskText.slice(0, 117)}...` : taskText,
          assignee: matchedAssignee || 'Not specified in conversation',
          deadline: deadline || 'None specified',
          priority,
          whyItMatters,
          epistemicStatus: isExplicit ? 'EXPLICIT' : 'INFERRED',
          epistemicReason: isExplicit
            ? `Assignee (${matchedAssignee}) and task explicitly named in message text.`
            : 'Task identified via imperative language; assignee is unstated in conversation text.',
          sourceQuote: sentence,
          sourceMessageId: msg.id,
          speaker: msg.speaker,
          timestamp: msg.timestamp,
        })
      }
    })
  })

  return items
}

/**
 * Extracts key decisions from messages.
 */
function extractDecisions(messages) {
  const decisions = []
  let count = 0

  messages.forEach((msg) => {
    const sentences = splitSentences(msg.text)
    sentences.forEach((sentence) => {
      let isDecision = false

      for (const pattern of DECISION_PATTERNS) {
        if (pattern.test(sentence)) {
          isDecision = true
          break
        }
      }

      // Avoid questions disguised with decision words like "Have we decided yet?"
      if (sentence.trim().endsWith('?')) {
        isDecision = false
      }

      if (isDecision) {
        const isFirm = /\b(?:decided|agreed|confirmed|approved|final\s+decision)\b/i.test(sentence)
        count++

        let priority = 'HIGH'
        let whyItMatters = 'Establishes team alignment and impacts upcoming deliverable execution.'

        if (URGENT_REGEX.test(sentence) || /rollback|cancel|hotfix/i.test(sentence)) {
          priority = 'CRITICAL'
          whyItMatters = 'Critical incident resolution or architecture change decision.'
        }

        decisions.push({
          id: `dec-${count}`,
          category: 'decision',
          title: sentence.length > 120 ? `${sentence.slice(0, 117)}...` : sentence,
          priority,
          whyItMatters,
          epistemicStatus: isFirm ? 'EXPLICIT' : 'INFERRED',
          epistemicReason: isFirm
            ? 'Stated as an explicit resolution or consensus agreement.'
            : 'Heuristic alignment phrasing; may represent a tentative proposal.',
          sourceQuote: sentence,
          sourceMessageId: msg.id,
          speaker: msg.speaker,
          timestamp: msg.timestamp,
        })
      }
    })
  })

  return decisions
}

/**
 * Extracts deadlines and time commitments.
 */
function extractDeadlines(messages) {
  const deadlines = []
  let count = 0

  messages.forEach((msg) => {
    const sentences = splitSentences(msg.text)
    sentences.forEach((sentence) => {
      const match = sentence.match(DEADLINE_REGEX)
      if (match) {
        const timeMarker = match[0]
        const isUrgent = /today|eod|tonight|now|in\s+\d+\s*(?:min|hour)/i.test(timeMarker)
        count++

        deadlines.push({
          id: `dead-${count}`,
          category: 'deadline',
          title: `Commitment: ${timeMarker}`,
          deadline: timeMarker,
          priority: isUrgent ? 'CRITICAL' : 'MEDIUM',
          whyItMatters: isUrgent
            ? 'Immediate time constraint expiring within the current work cycle.'
            : 'Scheduled timeline milestone relevant for planning.',
          epistemicStatus: 'EXPLICIT',
          epistemicReason: `Exact temporal boundary ("${timeMarker}") explicitly stated in transcript.`,
          sourceQuote: sentence,
          sourceMessageId: msg.id,
          speaker: msg.speaker,
          timestamp: msg.timestamp,
        })
      }
    })
  })

  return deadlines
}

/**
 * Extracts user mentions and direct callouts.
 */
function extractMentions(messages) {
  const mentions = []
  let count = 0
  const seenMentions = new Set()

  messages.forEach((msg) => {
    const matches = msg.text.matchAll(/@([A-Za-z0-9_.-]+)/g)
    for (const match of matches) {
      const targetUser = match[1]
      const key = `${targetUser}-${msg.id}`
      if (!seenMentions.has(key)) {
        seenMentions.add(key)
        count++

        const isUrgent = URGENT_REGEX.test(msg.text)

        mentions.push({
          id: `men-${count}`,
          category: 'mention',
          title: `@${targetUser} called out by ${msg.speaker}`,
          target: targetUser,
          priority: isUrgent ? 'CRITICAL' : 'LOW',
          whyItMatters: isUrgent
            ? `Urgent direct callout to @${targetUser} requiring prompt attention.`
            : `Informational ping or task tag to @${targetUser}.`,
          epistemicStatus: 'EXPLICIT',
          epistemicReason: `Direct @mention tag present in verbatim message text.`,
          sourceQuote: msg.text,
          sourceMessageId: msg.id,
          speaker: msg.speaker,
          timestamp: msg.timestamp,
        })
      }
    }
  })

  return mentions
}

/**
 * Extracts unanswered questions with heuristic uncertainty.
 * Evaluates whether subsequent messages from other speakers resolve the inquiry.
 */
function extractUnansweredQuestions(messages) {
  const questions = []
  let count = 0

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const sentences = splitSentences(msg.text)

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim()
      const isQuestion = trimmed.endsWith('?') || QUESTION_STARTERS.test(trimmed)

      // Exclude rhetorical questions, casual check-ins, or polite imperatives ("Can you please do X?")
      const isImperativeRequest = /\b(?:can\s+you|could\s+you|would\s+you\s+mind)\s+(?:please\s+)?(?:check|send|fix|update|merge|review)/i.test(trimmed)
      const isCasual = /^(how\s+are\s+you|how's\s+it\s+going|what's\s+up)\b/i.test(trimmed)

      if (isQuestion && !isImperativeRequest && !isCasual && trimmed.length > 10) {
        // Look ahead in subsequent messages for an answer
        let answered = false
        const questionWords = trimmed
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)

        // Inspect next 5 messages from other speakers
        for (let j = i + 1; j < Math.min(messages.length, i + 6); j++) {
          const nextMsg = messages[j]
          if (nextMsg.speaker === msg.speaker) continue // Same speaker continuing

          // Direct reply indicators
          if (
            nextMsg.text.toLowerCase().includes(`@${msg.speaker.toLowerCase()}`) ||
            /^(yes|no|done|fixed|sure|already|we did|it's|it is|not yet|i think|because|on it)\b/i.test(nextMsg.text)
          ) {
            answered = true
            break
          }

          // Lexical overlap check
          const nextWords = nextMsg.text.toLowerCase().split(/\s+/)
          const overlap = questionWords.filter((w) => nextWords.includes(w))
          if (overlap.length >= 2) {
            answered = true
            break
          }
        }

        if (!answered) {
          count++
          const isUrgent = URGENT_REGEX.test(trimmed)

          questions.push({
            id: `ques-${count}`,
            category: 'question',
            title: trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed,
            priority: isUrgent ? 'CRITICAL' : 'MEDIUM',
            whyItMatters: isUrgent
              ? 'Urgent blocker inquiry left unanswered in conversation; blocks progress.'
              : 'Open question without a detected answer in subsequent messages.',
            epistemicStatus: 'INFERRED',
            epistemicReason: 'Heuristic: No explicit answer or resolution detected in subsequent chat messages. (May have been resolved offline or in a private channel).',
            sourceQuote: trimmed,
            sourceMessageId: msg.id,
            speaker: msg.speaker,
            timestamp: msg.timestamp,
          })
        }
      }
    })
  }

  return questions
}

/**
 * Builds an extractive executive summary (TL;DR).
 * Extracts key contextual sentences without hallucination or generative distortion.
 */
function generateExecutiveSummary(messages, actions, decisions, questions, deadlines) {
  if (messages.length === 0) {
    return {
      bullets: [],
      stats: { totalMessages: 0, activeSpeakers: 0, timeSpan: 'N/A' },
    }
  }

  const speakers = Array.from(new Set(messages.map((m) => m.speaker).filter((s) => s && s !== 'Participant')))
  const firstTime = messages[0]?.timestamp || 'Start'
  const lastTime = messages[messages.length - 1]?.timestamp || 'End'
  const timeSpan = messages[0]?.timestamp && messages[messages.length - 1]?.timestamp ? `${firstTime} - ${lastTime}` : `${messages.length} messages`

  const bullets = []

  // Bullet 1: Core context & active participants
  bullets.push({
    label: 'Conversation Scope',
    text: `Discussion among ${speakers.length > 0 ? speakers.join(', ') : 'team members'} comprising ${messages.length} message(s).`,
    type: 'context',
  })

  // Bullet 2: Critical Decisions or Incident Direction
  if (decisions.length > 0) {
    const topDecision = decisions[0]
    bullets.push({
      label: 'Key Decision',
      text: `Agreed by ${topDecision.speaker}: "${topDecision.sourceQuote}"`,
      type: 'decision',
      sourceId: topDecision.sourceMessageId,
    })
  } else {
    bullets.push({
      label: 'Decisions',
      text: 'No formal decisions or consensus resolutions were explicitly finalized.',
      type: 'info',
    })
  }

  // Bullet 3: Immediate Next Action / Deadlines
  const urgentActions = actions.filter((a) => a.priority === 'CRITICAL' || a.priority === 'HIGH')
  if (urgentActions.length > 0) {
    const topAction = urgentActions[0]
    bullets.push({
      label: 'Top Action Item',
      text: `Assigned to ${topAction.assignee}: "${topAction.sourceQuote}" (Due: ${topAction.deadline})`,
      type: 'action',
      sourceId: topAction.sourceMessageId,
    })
  } else if (actions.length > 0) {
    const topAction = actions[0]
    bullets.push({
      label: 'Action Item',
      text: `Follow-up needed: "${topAction.sourceQuote}" (Owner: ${topAction.assignee})`,
      type: 'action',
      sourceId: topAction.sourceMessageId,
    })
  }

  // Bullet 4: Active Deadlines
  if (deadlines.length > 0) {
    const topDl = deadlines[0]
    bullets.push({
      label: 'Key Deadline',
      text: `${topDl.deadline} ("${topDl.sourceQuote}" — ${topDl.speaker})`,
      type: 'deadline',
      sourceId: topDl.sourceMessageId,
    })
  }

  // Bullet 5: Open Blockers or Unanswered Inquiries
  if (questions.length > 0) {
    const topQ = questions[0]
    bullets.push({
      label: 'Open Blocker / Question',
      text: `Unresolved inquiry from ${topQ.speaker}: "${topQ.sourceQuote}"`,
      type: 'question',
      sourceId: topQ.sourceMessageId,
    })
  }

  return {
    bullets,
    stats: {
      totalMessages: messages.length,
      activeSpeakers: speakers.length,
      timeSpan,
    },
  }
}

/**
 * Main analysis coordinator.
 * Runs all extractors and computes prioritized insights.
 *
 * @param {Array} messages Parsed messages
 * @param {Array<string>} participants Unique participants
 * @returns {object} Analysis result
 */
export function analyzeConversation(messages, participants) {
  if (!messages || messages.length === 0) {
    return {
      summary: { bullets: [], stats: { totalMessages: 0, activeSpeakers: 0, timeSpan: 'N/A' } },
      actions: [],
      decisions: [],
      deadlines: [],
      mentions: [],
      questions: [],
      allInsights: [],
      counts: {
        all: 0,
        actions: 0,
        decisions: 0,
        deadlines: 0,
        mentions: 0,
        questions: 0,
        critical: 0,
      },
    }
  }

  const actions = extractActionItems(messages, participants)
  const decisions = extractDecisions(messages)
  const deadlines = extractDeadlines(messages)
  const mentions = extractMentions(messages)
  const questions = extractUnansweredQuestions(messages)

  // Prioritize and combine into a unified insight list
  const allInsights = [...actions, ...decisions, ...deadlines, ...mentions, ...questions]

  // Priority order: CRITICAL -> HIGH -> MEDIUM -> LOW
  const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
  allInsights.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0))

  const summary = generateExecutiveSummary(messages, actions, decisions, questions, deadlines)

  const counts = {
    all: allInsights.length,
    actions: actions.length,
    decisions: decisions.length,
    deadlines: deadlines.length,
    mentions: mentions.length,
    questions: questions.length,
    critical: allInsights.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH').length,
  }

  return {
    summary,
    actions,
    decisions,
    deadlines,
    mentions,
    questions,
    allInsights,
    counts,
  }
}
