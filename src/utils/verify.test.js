import { parseChat, getParticipants } from './chatParser.js'
import { analyzeConversation } from './nlpExtractor.js'
import { SAMPLE_CONVERSATIONS } from './sampleData.js'
import { generateMarkdownBriefing } from './exportMarkdown.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
  console.log(`✅ PASS: ${message}`)
}

console.log('=== RUNNING AUTOMATED UNIT TESTS FOR THE UNREAD PROBLEM ===\n')

// Test 1: Parser on DevOps scenario
const devopsSample = SAMPLE_CONVERSATIONS[0].text
const devopsMessages = parseChat(devopsSample)
assert(devopsMessages.length >= 10, `Parsed ${devopsMessages.length} messages from DevOps scenario (expected >= 10)`)
assert(devopsMessages[0].speaker === 'Alex', `First speaker is Alex`)
assert(devopsMessages[0].timestamp === '10:02 AM', `First timestamp is 10:02 AM`)

// Test 2: Participant detection
const participants = getParticipants(devopsMessages)
assert(participants.includes('Alex'), 'Participants includes Alex')
assert(participants.includes('Sarah'), 'Participants includes Sarah')
assert(participants.includes('David'), 'Participants includes David')

// Test 3: WhatsApp and Simple chat format parsing
const whatsappSample = `10/09/2026, 09:30 AM - Priya: We must deploy the fix.
10/09/2026, 09:31 AM - Tom: Agreed to deploy now.
Priya: Who has the SSH key?`
const whatsappMessages = parseChat(whatsappSample)
assert(whatsappMessages.length === 3, `WhatsApp/Simple formats parsed correctly (found ${whatsappMessages.length})`)
assert(whatsappMessages[0].speaker === 'Priya', 'Priya detected in WhatsApp header')
assert(whatsappMessages[2].speaker === 'Priya', 'Priya detected in simple header')

// Test 4: Extractor on DevOps scenario
const devopsAnalysis = analyzeConversation(devopsMessages, participants)
assert(devopsAnalysis.actions.length > 0, `Extracted ${devopsAnalysis.actions.length} action items`)
assert(devopsAnalysis.decisions.length > 0, `Extracted ${devopsAnalysis.decisions.length} decisions`)
assert(devopsAnalysis.deadlines.length > 0, `Extracted ${devopsAnalysis.deadlines.length} deadlines`)
assert(devopsAnalysis.questions.length > 0, `Extracted ${devopsAnalysis.questions.length} unanswered questions`)

// Test 5: Epistemic Grounding & Zero Hallucination
const criticalActions = devopsAnalysis.actions.filter((a) => a.priority === 'CRITICAL')
assert(criticalActions.length > 0, 'Detected at least 1 CRITICAL action item')
criticalActions.forEach((item) => {
  assert(item.whyItMatters && item.whyItMatters.length > 0, `Priority has "Why this matters": "${item.whyItMatters}"`)
  assert(item.sourceQuote && devopsSample.includes(item.sourceQuote), `Source quote is verbatim from transcript: "${item.sourceQuote}"`)
})

// Test 6: Assignee distinction (Explicit vs Not Specified)
const assignedTask = devopsAnalysis.actions.find((a) => a.assignee === 'David')
assert(assignedTask !== undefined, 'Found task explicitly assigned to David')
assert(assignedTask.epistemicStatus === 'EXPLICIT', 'Explicit task is tagged as EXPLICIT')

// Test 7: Unanswered question detection
const unanswered = devopsAnalysis.questions.find((q) => q.sourceQuote.includes('Who approved'))
assert(unanswered !== undefined, 'Detected unanswered question: "Who approved the unindexed database migration script..."')
assert(unanswered.epistemicStatus === 'INFERRED', 'Unanswered question marked with INFERRED status')
assert(unanswered.epistemicReason.includes('Heuristic'), 'Unanswered question explains heuristic uncertainty')

// Test 8: Decision detection
const rollbackDecision = devopsAnalysis.decisions.find((d) => d.sourceQuote.toLowerCase().includes('agreed to rollback'))
assert(rollbackDecision !== undefined, 'Detected decision: rollback to release v2.4.1')

// Test 9: Markdown briefing generator
const mdBriefing = generateMarkdownBriefing(
  devopsAnalysis.summary,
  devopsAnalysis.actions,
  devopsAnalysis.decisions,
  devopsAnalysis.deadlines,
  devopsAnalysis.questions
)
assert(mdBriefing.includes('Executive Summary'), 'Markdown contains Executive Summary')
assert(mdBriefing.includes('Critical Action Items'), 'Markdown contains Critical Action Items')
assert(mdBriefing.includes('Key Decisions'), 'Markdown contains Key Decisions')

console.log('\n🎉 ALL 14 UNIT TESTS PASSED SUCCESSFULLY!')
