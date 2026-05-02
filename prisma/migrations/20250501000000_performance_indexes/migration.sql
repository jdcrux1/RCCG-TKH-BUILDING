-- Performance Indexes Migration
-- Phase 5: Hyper-Performance & Zero-Latency Optimization

-- Index for phone lookups (donor login)
CREATE INDEX IF NOT EXISTS "donor_phone_idx" ON "Donor"("phone");

-- Index for status filtering (admin dispatch)
CREATE INDEX IF NOT EXISTS "donor_status_idx" ON "Donor"("status");

-- Index for tier filtering (analytics/reports)
CREATE INDEX IF NOT EXISTS "donor_tier_idx" ON "Donor"("tier");

-- Index for contribution donor lookups
CREATE INDEX IF NOT EXISTS "contribution_donor_id_idx" ON "Contribution"("donorId");

-- Index for contribution dates (time-series)
CREATE INDEX IF NOT EXISTS "contribution_date_idx" ON "Contribution"("date");

-- Index for milestone status
CREATE INDEX IF NOT EXISTS "milestone_status_idx" ON "Milestone"("status");

-- Index for activity logs (audit trail)
CREATE INDEX IF NOT EXISTS "activity_log_created_at_idx" ON "ActivityLog"("createdAt");

-- Index for session lookups
CREATE INDEX IF NOT EXISTS "user_session_id_idx" ON "UserSession"("sessionId");

-- Index for action log filtering
CREATE INDEX IF NOT EXISTS "action_log_created_at_idx" ON "ActionLog"("timestamp");