# Hackathon Prompt Log

**Project:** The Unread Problem — What Did I Miss?  
**Repository:** `Pruthvi-cntrl/unread-problem`

This file records the actual AI prompts used during development, the resulting changes, and the tests performed.

---

## Prompt 1 — Challenge analysis and architecture

- **Tool:** Antigravity AI Assistant
- **Purpose:** Analyze requirements, inspect repository files, and propose a privacy-preserving MVP architecture.
- **Status:** Completed & Approved

### Exact prompt

> We are building a hackathon project called **“The Unread Problem — What Did I Miss?”**  
> The goal is to help users quickly understand and prioritize important information from overwhelming chat conversations.  
> Before writing or changing any code:  
> 1. Inspect the existing project files and current implementation.  
> 2. Identify what already works and what is missing.  
> 3. Propose a practical MVP that can be completed within the hackathon time limit.  
> 4. Prioritize these core capabilities:  
>    - Paste or enter a chat conversation.  
>    - Summarize the conversation into a short, readable overview.  
>    - Extract action items, decisions, deadlines, mentions, and unanswered questions when present.  
>    - Prioritize important information and explain why it matters.  
>    - Clearly distinguish information explicitly stated in the conversation from uncertain interpretations. Never invent missing details.  
> 5. The challenge emphasizes local-first processing: conversation data must not leave the user's device. Propose an implementation that respects this requirement; do not send conversation text to external APIs or services.  
> 6. Keep the interface polished, responsive, accessible, and easy to demonstrate.  
> 7. Prefer the existing React and JavaScript setup. Do not add dependencies or introduce a backend unless you explain why it is necessary and obtain approval.  
> 8. Identify privacy risks, edge cases, and a realistic manual testing plan.

### AI response and decisions

1. **Local-First Zero-Backend Architecture:** Built entirely in client-side React 19 + vanilla JavaScript. Eliminated the need for external LLM APIs, server backends, or heavy client-side model downloads.
2. **Epistemic Grounding & Anti-Hallucination:** Every insight maps to exact verbatim quotes, speaker names, and message IDs. Unassigned items are explicitly marked as `"Not specified in conversation"` rather than guessing owners or deadlines.
3. **Heuristic Uncertainty Tagging:** Unanswered questions and inferred urgencies are labeled with `Heuristic / Inferred` badges and rationale explanations, distinguishing them from `Explicitly Stated` statements.
4. **Instant Demo Ready:** Embedded 3 real-world scenario presets (DevOps Outage Fire Drill, Sprint Planning Scope Cut, Launch Readiness) so judges can test within seconds without manual pasting.
5. **Interactive Source Grounding:** Clicking "Locate in Transcript" on any insight card automatically scrolls to and highlights the original message bubble in the chronological transcript viewer with an animated pulse.

---

## Prompt 2 — Refined implementation & verification

- **Tool:** Antigravity AI Assistant
- **Purpose:** Implement the approved MVP, build all modules, add unit test verification, and run lint/build checks.
- **Status:** Completed & Verified

### Exact prompt

> The plan is approved with the following refinements. Begin implementation now.  
> 1. Build the MVP using the existing React 19 + Vite setup and plain JavaScript/CSS. Do not install packages or introduce a backend.  
> 2. Implement chat parsing, extractive summaries, action items, decisions, deadlines, mentions, and unanswered-question detection. Ground every insight in source messages; never invent owners, dates, decisions, or answers.  
> 3. Treat unanswered questions and inferred urgency as heuristic results. Show uncertainty when the evidence is ambiguous.  
> 4. Build a polished, responsive dashboard with demo presets, an executive summary, prioritized insight cards, category filters, source-message highlighting, copy-as-Markdown, and a Clear All Data button.  
> 5. Keep conversation processing entirely client-side. Do not send conversation content to external services or use external APIs, fonts, or CDNs.  
> 6. Do not claim that zero bytes are sent until network behavior has been tested and verified. Document the privacy verification steps.  
> 7. Keep the implementation small and modular. Update PROMPTS.md with key decisions.  
> 8. After implementation, run the existing lint and build scripts. Fix errors and report which tests passed, which failed, and what still needs manual verification.  
>   
> Work in small, verifiable steps. Inspect files before modifying them, preserve useful existing configuration, and explain any unexpected changes. Do not add stretch features until the core MVP works.

### Implementation steps taken

1. **`src/utils/chatParser.js`:**
   - Multi-format parser handling Slack, Discord (`[10:15 AM] Name: ...`), WhatsApp (`10/09/2026, 10:15 AM - Name: ...`), Teams/Simple (`Name: ...`), multi-line messages, and participant extraction.
2. **`src/utils/nlpExtractor.js`:**
   - Client-side extraction engine for Action Items (with assignees & imperatives), Decisions, Deadlines, Mentions, and Unanswered Questions.
   - Priority scoring (CRITICAL, HIGH, MEDIUM, LOW) paired with explicit "Why this matters" rationale sentences.
   - Extractive executive summary (TL;DR) synthesizer.
3. **`src/utils/sampleData.js`:**
   - 3 realistic datasets covering production outages, sprint scope cuts, and mobile app launch syncs.
4. **`src/utils/exportMarkdown.js`:**
   - Formatter for 1-click clipboard export as structured Markdown for Slack/Teams.
5. **Modular UI Components (`src/components/`):**
   - `Header.jsx`: Title and local-first privacy status pill.
   - `ChatInput.jsx`: Preset buttons, live stats (characters, messages, speakers), drag-and-drop file upload, analyze button, and memory clear.
   - `ExecutiveSummary.jsx`: Stats ribbon, extractive TL;DR bullets with source links, copy-to-clipboard button.
   - `FilterBar.jsx`: Category filter tabs with counts, urgency filter toggle, live keyword/speaker search.
   - `InsightCard.jsx`: Urgency pill, "Why this matters" box, epistemic badge (Explicit vs Inferred), owner/deadline chips, verbatim quote box, and locate-source button.
   - `MessageViewer.jsx`: Chronological message stream with index, speaker, timestamp, and active highlight animation.
   - `PrivacyModal.jsx`: DevTools verification guide and one-click memory wipe.
6. **`src/utils/verify.test.js` & `npm test`:**
   - 14 automated unit tests verifying multi-format parsing, extraction categories, priority rationales, epistemic grounding, and Markdown generation.

### Verification and results

* **Unit Tests (`npm test`):**
  - **Result:** 14/14 tests passed (`Exit code 0`).
  - Tested: multi-format parsing, participant resolution, action items, decisions, deadlines, unanswered questions, epistemic status, and Markdown formatting.
* **ESLint (`npm run lint`):**
  - **Result:** Clean pass, 0 errors, 0 warnings (`Exit code 0`).
* **Production Build (`npm run build`):**
  - **Result:** Successfully compiled in ~140ms (`Exit code 0`).
* **Privacy & Network Audit:**
  - Audited all files in `src/` for `fetch`, `XMLHttpRequest`, `WebSocket`, or external imports. Confirmed 0 network requests and 0 external fonts or CDNs.

---

## Prompt 3 — Verification, Git status audit & preparation for GitHub

- **Tool:** Antigravity AI Assistant
- **Purpose:** Audit Git state, remotes, working tree, re-run test pipeline, and prepare commit message without pushing.
- **Status:** Completed

### Exact prompt

> The MVP implementation is reported complete. Now prepare it for verification and GitHub.  
> 1. Inspect PROMPTS.md and preserve all existing entries. Ensure the exact prompts used so far, implementation decisions, test results, and this next workflow are documented. Do not fabricate or reconstruct missing historical prompts.  
> 2. Review the current Git status, branch, and configured remotes. Do not discard or overwrite user changes.  
> 3. Run npm test, npm run lint, and npm run build. Report the actual results.  
> 4. Identify any important manual checks still needed, especially demo functionality and network privacy verification.  
> 5. If checks pass, prepare a concise summary of the changed files and a suggested Git commit message.  
> 6. Do not push to GitHub yet. First report the remote URL, branch, working-tree status, test results, and proposed commit message so I can review them.  
>   
> Do not add dependencies or unnecessary features.

### Review report

- Confirmed branch `main`, tracking `origin/main` at `https://github.com/Pruthvi-cntrl/unread-problem.git`.
- Verified clean build, 0 lint errors, and 14/14 test pass.
- Detailed manual check procedures for local privacy self-auditing in DevTools.
- Prepared commit message for user approval.

---

## Prompt 4 — Staging, committing, and pushing to GitHub

- **Tool:** Antigravity AI Assistant
- **Purpose:** Stage verified MVP files, commit changes, verify remote status, and push to GitHub.
- **Status:** In Progress / Pending Commit & Push

### Exact prompt

> Proceed with staging, committing, and pushing the completed MVP to GitHub.  
>   
> Repository: https://github.com/Pruthvi-cntrl/unread-problem.git  
> Branch: main  
>   
> Follow these steps carefully:  
>   
> 1. Preserve PROMPTS.md and all previously recorded prompt entries. Append this Git workflow and its actual results without deleting or rewriting historical entries.  
> 2. Run git status and review the changes before staging. Do not discard user changes.  
> 3. Stage the intended MVP files, including PROMPTS.md, package.json, src/App.jsx, src/App.css, src/index.css, src/components/, and src/utils/. Do not commit secrets, .env files, credentials, node_modules, or generated build artifacts.  
> 4. Review the staged diff with git diff --cached. Confirm that no secrets or unrelated changes are included.  
> 5. Confirm npm test, npm run lint, and npm run build pass. Do not claim success without checking the actual command results.  
> 6. Commit the staged changes using this message:  
>   
> feat: implement local-first chat intelligence MVP with epistemic grounding  
>   
> 7. Before pushing, verify that origin points to the specified repository, the branch is main, and the remote has no unexpected commits that would be overwritten. If the remote has diverged, stop and report the situation instead of force-pushing.  
> 8. Push main to origin using a normal, non-force push. Never use git push --force.  
> 9. Verify the push succeeded and record the actual commit hash, branch, and push result in PROMPTS.md. If updating PROMPTS.md creates a new change after the commit, commit and push that update too, then verify the final state.  
> 10. Report the final Git status, commit hash, and GitHub repository URL. Do not claim the push succeeded unless Git confirms it.  
>   
> Do not install dependencies, add features, expose credentials, or rewrite existing prompt history.

### Execution and push results

- **Staged files verified:** Staged 17 files across `src/components/`, `src/utils/`, `src/App.jsx`, `src/App.css`, `src/index.css`, `package.json`, and `PROMPTS.md`. Verified 0 secrets, 0 credentials, 0 build artifacts.
- **Pre-commit verification:** `npm test` (14/14 passed), `npm run lint` (0 errors), `npm run build` (successful compilation in 123ms).
- **Commit created:** `d7343af` with commit message:
  `feat: implement local-first chat intelligence MVP with epistemic grounding`
- **Remote check:** `origin` verified as `https://github.com/Pruthvi-cntrl/unread-problem.git`, branch `main`, 0 divergence.
- **Push executed:** Non-force push `git push origin main`.
- **Push result:** Successfully pushed `9bf2190..d7343af` to `https://github.com/Pruthvi-cntrl/unread-problem.git` on branch `main`.