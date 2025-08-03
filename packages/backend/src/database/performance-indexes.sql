-- Performance indexes for Smart Hospitality Operations Platform
-- These indexes are designed to optimize frequently used queries

-- =============================================================================
-- GUESTS TABLE INDEXES
-- =============================================================================

-- Index for profile completeness filtering with status
-- Optimizes: WHERE profile_completeness < X AND status = 'ACTIVE'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_profile_completeness_status
ON guests(profile_completeness, status) 
WHERE status = 'ACTIVE';

-- Index for guest creation tracking and dashboard queries
-- Optimizes: ORDER BY created_at, filtered by created_by_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_created_by_status_completeness
ON guests(created_by_id, status, profile_completeness, created_at);

-- Index for Mews ID lookups and sync operations
-- Optimizes: WHERE mews_id = 'X' for sync operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_mews_id
ON guests(mews_id) 
WHERE mews_id IS NOT NULL;

-- =============================================================================
-- USERS TABLE INDEXES  
-- =============================================================================

-- Index for user profile completeness and role filtering
-- Optimizes: WHERE profile_completeness < X AND role = 'Y'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_profile_completeness_role
ON users(profile_completeness, role, status)
WHERE profile_completeness < 80;

-- Index for active users by role
-- Optimizes: WHERE role = 'X' AND status = 'ACTIVE'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status
ON users(role, status)
WHERE status = 'ACTIVE';

-- Index for email lookups (login)
-- Optimizes: WHERE email = 'X' (already exists but ensuring)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email
ON users(email);

-- =============================================================================
-- VENDORS TABLE INDEXES
-- =============================================================================

-- Index for vendor category and rating filtering  
-- Optimizes: WHERE category = 'X' AND rating > Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_category_rating
ON vendors(category, rating, status)
WHERE rating > 0 AND status = 'ACTIVE';

-- Index for vendor profile completeness
-- Optimizes: dashboard vendor completeness queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_profile_completeness
ON vendors(profile_completeness, status)
WHERE status = 'ACTIVE';

-- =============================================================================
-- MEWS SYNC LOGS TABLE INDEXES
-- =============================================================================

-- Index for sync status and recent operations
-- Optimizes: WHERE status = 'X' AND created_at > DATE for dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mews_sync_logs_status_created
ON mews_sync_logs(status, created_at)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Index for entity type and sync tracking
-- Optimizes: WHERE entity_type = 'X' AND status = 'Y'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mews_sync_logs_entity_status
ON mews_sync_logs(entity_type, status, created_at);

-- Index for error tracking and alerts
-- Optimizes: WHERE status = 'ERROR' for alert generation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mews_sync_logs_errors
ON mews_sync_logs(status, created_at, entity_type)
WHERE status = 'ERROR';

-- =============================================================================
-- AUDIT LOGS TABLE INDEXES
-- =============================================================================

-- Index for user activity tracking
-- Optimizes: WHERE user_id = 'X' AND created_at > DATE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action_created
ON audit_logs(user_id, action, created_at)
WHERE created_at > NOW() - INTERVAL '7 days';

-- Index for recent activity dashboard
-- Optimizes: WHERE created_at > DATE ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_recent_activity
ON audit_logs(created_at DESC)
WHERE created_at > NOW() - INTERVAL '24 hours';

-- =============================================================================
-- PASSWORD RESET TOKENS TABLE INDEXES
-- =============================================================================

-- Index for active password reset tokens
-- Optimizes: WHERE token = 'X' AND used = false AND expires_at > NOW()
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_password_reset_tokens_active
ON password_reset_tokens(token, expires_at, used)
WHERE used = false AND expires_at > NOW();

-- =============================================================================
-- BUSINESS RULES TABLE INDEXES
-- =============================================================================

-- Index for active business rules
-- Optimizes: WHERE is_active = true for rule engine
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_rules_active
ON business_rules(is_active, priority, rule_type)
WHERE is_active = true;

-- =============================================================================
-- PROFILE COMPLETENESS TABLE INDEXES (if separate table exists)
-- =============================================================================

-- Index for entity completeness lookups
-- Note: This may not exist depending on schema design
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_completeness_entity
-- ON profile_completeness(entity_type, entity_id, score);

-- =============================================================================
-- OPTIMIZATION NOTES
-- =============================================================================

/*
Performance Index Strategy:

1. Composite indexes are ordered by selectivity (most selective first)
2. Partial indexes with WHERE clauses reduce index size and improve performance
3. CONCURRENTLY option allows creation without blocking other operations
4. Indexes target the most common query patterns identified in the application

Key Query Patterns Optimized:
- Dashboard metrics aggregation (counts by status, completeness)
- Profile completeness filtering and sorting
- Sync operation tracking and error monitoring
- User authentication and role-based access
- Recent activity and audit trail queries
- Vendor search and filtering

Monitoring:
- Monitor index usage with: SELECT * FROM pg_stat_user_indexes;
- Check query performance with: EXPLAIN ANALYZE <query>;
- Monitor index size with: SELECT pg_size_pretty(pg_total_relation_size('index_name'));

Maintenance:
- Indexes will be maintained automatically by PostgreSQL
- Consider REINDEX if index bloat becomes an issue
- Monitor for unused indexes and remove if necessary
*/