# Architecture Audit Prompt for AI Art Arena

## Objective
Evaluate all files in `d:\Projects\ai-art-arena` against the future-proofed architecture standards defined in the project's architecture documentation. Identify gaps, violations, and opportunities for improvement.

---

## Evaluation Criteria

### 1. **Configuration System Compliance**

**Check:**
- [ ] Are all "magic numbers" moved to centralized configuration files?
- [ ] Is `src/lib/config.ts` (or `src/lib/constants.ts`) the single source of truth for configuration?
- [ ] Are environment variables properly documented and validated?
- [ ] Are feature flags implemented for major features (voting, archive, analytics)?
- [ ] Can contest parameters be changed without redeploying code?

**Files to Review:**
- `src/lib/constants.ts` or `src/lib/config.ts`
- `.env.local.example`
- Any component files that might have hardcoded values

**Red Flags:**
- Hardcoded numbers like `6` (artwork count), `24` (hours), `7` (days) scattered throughout components
- Missing centralized configuration file
- No environment variable validation
- Configuration spread across multiple files

---

### 2. **Database Schema Standards**

**Check:**
- [ ] Does the schema include a `settings` table for database-driven configuration?
- [ ] Are contests configurable per-contest (config JSONB column)?
- [ ] Is there position validation that adapts to max_artworks setting?
- [ ] Are indexes present on frequently queried columns (status, dates, contest_id)?
- [ ] Is there a strategy for vote count materialization for scale?
- [ ] Are timestamps (created_at, updated_at) on all tables?
- [ ] Are there proper CHECK constraints for data validation?

**Files to Review:**
- `supabase/migrations/*.sql`
- Database schema documentation

**Red Flags:**
- No `settings` table
- Hardcoded position checks (e.g., `position BETWEEN 1 AND 6`)
- Missing indexes on foreign keys or status columns
- No updated_at triggers
- Vote counting always uses COUNT(*) without materialization option

---

### 3. **Database Functions & Triggers**

**Check:**
- [ ] Does `record_vote()` function check database settings for cooldown/config?
- [ ] Does `get_active_contest()` return contest config in response?
- [ ] Is there an `archive_active_contest()` function with winner calculation?
- [ ] Are there helper functions like `get_setting()` and `update_setting()`?
- [ ] Is position validation handled by database trigger, not application code?
- [ ] Are functions using SECURITY DEFINER where appropriate?

**Files to Review:**
- `supabase/migrations/*_functions.sql`
- API route files that call database functions

**Red Flags:**
- Business logic in application code instead of database functions
- No dynamic reading of settings from database
- Hardcoded values in SQL functions
- No trigger-based validation

---

### 4. **Component Flexibility**

**Check:**
- [ ] Does ContestGrid dynamically adapt to any artwork count (1-12)?
- [ ] Are grid layouts defined in configuration, not hardcoded?
- [ ] Do components read from centralized config instead of hardcoding values?
- [ ] Are responsive breakpoints centralized?
- [ ] Can components handle edge cases (0 artworks, 1 artwork, 12 artworks)?

**Files to Review:**
- `src/components/contest/*.tsx`
- `src/app/contest/**/*.tsx`
- Any grid/layout components

**Red Flags:**
- Grid assumes exactly 6 artworks
- Layout breaks with different artwork counts
- Hardcoded className strings instead of dynamic generation
- Missing responsive breakpoints

---

### 5. **API Route Standards**

**Check:**
- [ ] Do API routes check feature flags before executing?
- [ ] Is rate limiting implemented on sensitive endpoints (voting)?
- [ ] Are database functions used instead of inline SQL queries?
- [ ] Are errors returned in a consistent structure?
- [ ] Is IP hashing used for privacy (not raw IPs stored)?
- [ ] Are user-agent and referrer captured for analytics?

**Files to Review:**
- `src/app/api/**/*.ts`
- `src/lib/rate-limit.ts` (if exists)

**Red Flags:**
- No rate limiting
- Raw SQL in API routes instead of database function calls
- Storing plaintext IP addresses
- Inconsistent error response formats
- No feature flag checks

---

### 6. **Type Safety & Validation**

**Check:**
- [ ] Are TypeScript types defined for all database models?
- [ ] Are there runtime validators for configuration values?
- [ ] Are API inputs validated before processing?
- [ ] Are helper functions like `isValidArtworkCount()` available?
- [ ] Are type exports available from config modules?

**Files to Review:**
- `src/types/*.ts` or `src/types/database.ts`
- `src/lib/config.ts`
- API route validation logic

**Red Flags:**
- Using `any` instead of proper types
- No input validation
- No validators for configuration ranges
- Missing type exports

---

### 7. **Security Implementation**

**Check:**
- [ ] Is there middleware setting security headers (CSP, X-Frame-Options, etc.)?
- [ ] Are RLS policies enabled on all tables?
- [ ] Is rate limiting active on public endpoints?
- [ ] Are service role keys only used server-side?
- [ ] Is user input sanitized?
- [ ] Are SQL injection attacks prevented (parameterized queries)?

**Files to Review:**
- `middleware.ts`
- `supabase/migrations/*_rls.sql`
- API routes accepting user input

**Red Flags:**
- No middleware for security headers
- Missing RLS policies
- Client-side code using service role key
- String concatenation in SQL queries
- No rate limiting

---

### 8. **Caching & Performance**

**Check:**
- [ ] Are cache revalidation times configurable?
- [ ] Is static generation used for archive pages?
- [ ] Are database queries optimized with proper indexes?
- [ ] Is there a strategy for materialized views or counts?
- [ ] Are real-time subscriptions optional (feature flag)?

**Files to Review:**
- `src/app/archive/**/*.tsx`
- `src/app/contest/**/*.tsx`
- Database query files
- `src/lib/config.ts` (cache settings)

**Red Flags:**
- No ISR/SSG configuration
- Missing revalidate times
- No indexes on frequently queried columns
- Always querying with COUNT(*) for large tables
- Real-time always on without opt-out

---

### 9. **Code Organization & Architecture**

**Check:**
- [ ] Is configuration centralized in `src/lib/config.ts` or `src/lib/constants.ts`?
- [ ] Are database utilities in `src/lib/supabase/`?
- [ ] Are reusable components in `src/components/`?
- [ ] Are types centralized in `src/types/`?
- [ ] Is business logic in database functions, not scattered in components?

**Files to Review:**
- Project directory structure
- Import statements across files

**Red Flags:**
- Configuration scattered across multiple files
- Database queries in component files
- Business logic in React components
- No clear separation of concerns

---

### 10. **Feature Flags & Toggles**

**Check:**
- [ ] Are major features behind toggleable flags (VOTING, ARCHIVE, ANALYTICS)?
- [ ] Can features be disabled without code changes (via env vars or database)?
- [ ] Do API routes check feature flags before executing?
- [ ] Are feature flags documented?

**Files to Review:**
- `src/lib/config.ts` (FEATURES object)
- API routes
- Component conditional rendering

**Red Flags:**
- No feature flag system
- Features always enabled
- No ability to disable voting or archive
- Flags hardcoded instead of configurable

---

### 11. **Upgrade Path Readiness**

**Check:**
- [ ] Is rate limiting abstracted (easy to swap in-memory for Redis)?
- [ ] Are votes table ready for partitioning (vote_date column exists)?
- [ ] Are database functions written to support future auth (optional user_id)?
- [ ] Is vote counting abstracted (can switch to materialized view)?
- [ ] Are indexes created for scaling (contest status, vote dates, artwork_id)?

**Files to Review:**
- `src/lib/rate-limit.ts`
- `supabase/migrations/*`
- Vote counting logic

**Red Flags:**
- Tight coupling to specific implementations
- No abstraction layers
- Missing columns for future features
- No performance optimization paths

---

### 12. **Documentation & Maintenance**

**Check:**
- [ ] Is there a README explaining architecture decisions?
- [ ] Are environment variables documented with examples?
- [ ] Are database migrations numbered and documented?
- [ ] Are complex functions commented with purpose/usage?
- [ ] Is there a CHANGELOG or migration guide?

**Files to Review:**
- `README.md`
- `.env.local.example`
- `supabase/migrations/README.md` (if exists)
- Inline code comments

**Red Flags:**
- No documentation
- Missing .env.example
- Unclear migration order
- No comments on complex logic

---

## Audit Process

### Step 1: Configuration Audit
1. Read `src/lib/constants.ts` or `src/lib/config.ts`
2. Check for centralized CONTEST_CONFIG, GRID_CONFIG, CACHE_CONFIG, FEATURES
3. Verify all "magic numbers" are imported from config, not hardcoded
4. List any hardcoded values found in components

### Step 2: Database Audit
1. Read all files in `supabase/migrations/`
2. Check for settings table
3. Verify contests table has config JSONB column
4. Check for proper indexes and constraints
5. List missing indexes or tables

### Step 3: Function Audit
1. Read database function definitions
2. Verify they read from settings table
3. Check for proper error handling and return types
4. List functions that need updates

### Step 4: Component Audit
1. Read all component files in `src/components/` and `src/app/`
2. Check for hardcoded values (6 artworks, 24 hours, etc.)
3. Verify grid components are dynamic
4. List components that need refactoring

### Step 5: API Audit
1. Read all files in `src/app/api/`
2. Check for rate limiting
3. Verify feature flag checks
4. Check error response consistency
5. List security issues

### Step 6: Security Audit
1. Check for `middleware.ts` with security headers
2. Verify RLS policies exist
3. Check for IP hashing in vote recording
4. List security gaps

---

## Output Format

For each category above, provide:

### ✅ Passing Items
List what's correctly implemented according to standards

### ❌ Failing Items
List what's missing or incorrectly implemented

### ⚠️ Warnings
List items that work but could be improved

### 🔧 Recommended Changes
Provide specific, actionable steps to align with architecture standards, prioritized by:
1. **Critical** - Security issues, data loss risks
2. **High** - Scalability blockers, major technical debt
3. **Medium** - Code quality, maintainability
4. **Low** - Nice-to-have improvements

---

## Example Output Structure

```markdown
## Configuration System Compliance

### ✅ Passing
- Environment variables are documented in .env.local.example
- Basic constants exist in src/lib/constants.ts

### ❌ Failing
- No FEATURES object for feature flags
- Artwork count is hardcoded to 6 in ContestGrid component
- Vote cooldown is hardcoded to 24 hours in record_vote function
- No centralized GRID_CONFIG for dynamic layouts

### ⚠️ Warnings
- Some config exists but is not used consistently across the app
- Missing validation for config values

### 🔧 Recommended Changes

**Critical:**
- None

**High:**
1. Create centralized config system in src/lib/config.ts with:
   - CONTEST_CONFIG (min/max artworks, duration, cooldown)
   - GRID_CONFIG (dynamic layouts for 1-12 artworks)
   - FEATURES (voting, archive, analytics flags)
   - CACHE_CONFIG (revalidation times)

2. Update all components to import from config instead of hardcoding

**Medium:**
3. Add runtime validators for config values
4. Add TypeScript types for config objects

**Low:**
5. Document config options in README
```

---

## Success Criteria

The codebase is considered **future-proofed** when:

1. ✅ All magic numbers are in centralized config
2. ✅ Contest parameters can change without code deploy
3. ✅ Grid layout adapts to any artwork count (1-12)
4. ✅ Feature flags exist for major features
5. ✅ Database-driven settings table exists and is used
6. ✅ Rate limiting is implemented
7. ✅ Security headers are set via middleware
8. ✅ All tables have proper indexes
9. ✅ Database functions handle business logic
10. ✅ Code is organized with clear separation of concerns

---

## Next Steps After Audit

1. **Prioritize findings** by critical → high → medium → low
2. **Create implementation plan** with specific tasks
3. **Update architecture incrementally** (don't rewrite everything at once)
4. **Test each change** before moving to next
5. **Update documentation** as changes are made
6. **Run audit again** to verify improvements

---

**Run this audit and provide a comprehensive report following the format above.**
