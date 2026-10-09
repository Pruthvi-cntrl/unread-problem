/**
 * Generates formatted Markdown string for the executive briefing
 * to paste directly into Slack, Teams, or email.
 */

export function generateMarkdownBriefing(summary, actions, decisions, deadlines, questions) {
  const parts = []

  parts.push('# 📋 Conversation Briefing: What Did I Miss?')
  parts.push('Generated with *The Unread Problem* (100% Client-Side Processing)\n')

  if (summary && summary.stats) {
    parts.push(`**Stats:** ${summary.stats.totalMessages} messages | ${summary.stats.activeSpeakers} speakers | Span: ${summary.stats.timeSpan}\n`)
  }

  if (summary && summary.bullets && summary.bullets.length > 0) {
    parts.push('## ⚡ Executive Summary (TL;DR)')
    summary.bullets.forEach((b) => {
      parts.push(`- **${b.label}:** ${b.text}`)
    })
    parts.push('')
  }

  const urgentActions = actions.filter((a) => a.priority === 'CRITICAL' || a.priority === 'HIGH')
  if (urgentActions.length > 0) {
    parts.push('## 🔥 Critical Action Items')
    urgentActions.forEach((a) => {
      parts.push(`- [ ] **${a.title}**`)
      parts.push(`  - *Owner:* ${a.assignee} | *Deadline:* ${a.deadline}`)
      parts.push(`  - *Why it matters:* ${a.whyItMatters}`)
      parts.push(`  - *Source Quote:* "${a.sourceQuote}" (${a.speaker})`)
    })
    parts.push('')
  }

  const routineActions = actions.filter((a) => a.priority !== 'CRITICAL' && a.priority !== 'HIGH')
  if (routineActions.length > 0) {
    parts.push('## 📌 Routine Action Items')
    routineActions.forEach((a) => {
      parts.push(`- [ ] **${a.title}** (Owner: ${a.assignee} | Due: ${a.deadline})`)
    })
    parts.push('')
  }

  if (decisions.length > 0) {
    parts.push('## 🎯 Key Decisions')
    decisions.forEach((d) => {
      parts.push(`- **${d.title}**`)
      parts.push(`  - *Decided by:* ${d.speaker} | *Status:* ${d.epistemicStatus}`)
      parts.push(`  - *Quote:* "${d.sourceQuote}"`)
    })
    parts.push('')
  }

  if (deadlines.length > 0) {
    parts.push('## ⏰ Deadlines & Commitments')
    deadlines.forEach((dl) => {
      parts.push(`- **${dl.deadline}** — "${dl.sourceQuote}" (${dl.speaker})`)
    })
    parts.push('')
  }

  if (questions.length > 0) {
    parts.push('## ❓ Unanswered Questions & Blockers')
    questions.forEach((q) => {
      parts.push(`- **${q.title}** (Asked by ${q.speaker})`)
      parts.push(`  - *Note:* ${q.epistemicReason}`)
      parts.push(`  - *Quote:* "${q.sourceQuote}"`)
    })
    parts.push('')
  }

  return parts.join('\n')
}
