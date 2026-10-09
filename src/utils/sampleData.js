/**
 * Realistic demo datasets for hackathon evaluation and demonstration.
 * These cover incident management, sprint planning, and client readiness.
 */

export const SAMPLE_CONVERSATIONS = [
  {
    id: 'devops-incident',
    title: '🚨 Production Incident: Payment Gateway Timeout (Urgent Fire Drill)',
    badge: 'Critical Outage',
    description: 'High-urgency outage discussion with blockers, explicit assignees, rollback decision, and unanswered root cause.',
    text: `[10:02 AM] Alex: @channel Team, we are seeing 504 timeouts on the payment checkout flow. Error rate jumped to 34%.
[10:03 AM] Sarah: I am looking at the telemetry now. Latency spiked right after the 10:00 AM migration deploy.
[10:04 AM] David: @Alex is this affecting all regions or just US-East?
[10:05 AM] Alex: Confirmed US-East and EU-West. Checkout is completely blocked for thousands of active users.
[10:06 AM] Sarah: We need to rollback the release immediately before we lose more revenue.
[10:07 AM] David: Agreed to rollback to release v2.4.1. Let's go with the previous stable container image.
[10:08 AM] Alex: Sarah, please execute the rollback on Kubernetes right now.
[10:09 AM] Sarah: I will handle the cluster rollback now. It should complete in 3 minutes.
[10:11 AM] David: Has anyone notified customer support about the outage banner?
[10:13 AM] Sarah: Rollback complete. Error rate dropping back to normal 0.1%.
[10:15 AM] Alex: Action item: David, please write the post-mortem draft by EOD today.
[10:16 AM] David: I will write the post-mortem report by EOD.
[10:18 AM] Alex: Who approved the unindexed database migration script without staging verification?
[10:20 AM] Alex: We must schedule a mandatory deployment review meeting by tomorrow at 10 AM.`,
  },
  {
    id: 'sprint-scope',
    title: '📋 Sprint Planning: Q4 Scope Cut & Architecture Alignment',
    badge: 'Sprint Planning',
    description: 'Team scope negotiation with consensus decisions, deadline constraints, and an open legal blocker question.',
    text: `[02:15 PM] Marcus: Thanks for joining everyone. We have 14 days left in the sprint and our velocity indicates we are 40 points over capacity.
[02:17 PM] Elena: If we want to ship on time, we have to cut either Dark Mode or the CSV Export feature.
[02:19 PM] Chloe: Dark Mode is heavily requested by beta users, but CSV Export is needed for enterprise compliance.
[02:22 PM] Marcus: We decided to postpone Dark Mode to Q1 and keep CSV Export in this release.
[02:23 PM] Elena: Agreed. I will update the Jira sprint backlog and remove Dark Mode tickets.
[02:25 PM] Marcus: Elena, can you please deliver the finalized CSV schema specs by Friday at 5 PM?
[02:26 PM] Elena: Yes, I will send the CSV schema specs by Friday 5 PM.
[02:28 PM] Chloe: Do we have legal approval for exporting user audit logs to CSV in EU regions?
[02:30 PM] Marcus: Someone needs to prepare the staging environment for load testing.
[02:32 PM] Chloe: We agreed to use Redis for session caching instead of DynamoDB.`,
  },
  {
    id: 'client-readiness',
    title: '🚀 Launch Readiness: Mobile App Release Candidate',
    badge: 'Launch Sync',
    description: 'Go/No-Go release discussion featuring store approvals, explicit tasks, and an unanswered QA question.',
    text: `[11:00 AM] Priya: Good morning team. Today is the Go/No-Go decision for iOS App Store submission.
[11:02 AM] Tom: Android build passed all Google Play automated checks this morning.
[11:04 AM] Priya: @Tom did we resolve the crash on iPhone 12 during biometric login?
[11:06 AM] Tom: Yes, patched in build 412. Tested and verified on test devices.
[11:08 AM] Maya: Marketing assets and screenshots are uploaded.
[11:10 AM] Priya: We confirmed that App Store release date is next Tuesday.
[11:11 AM] Priya: Tom, please submit the iOS binary to App Store Review by 4 PM today.
[11:12 AM] Tom: I will submit the binary by 4 PM today.
[11:14 AM] Maya: Action item: Maya will publish the announcement blog post on launch day.
[11:16 AM] Tom: Has anyone tested the push notifications on production APNs certificates?`,
  },
]
