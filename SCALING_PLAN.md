# 🚀 AI Company Platform - Scaling Plan

## Current State (Phase 1)
- **Database:** SQLite (312KB file)
- **Users:** Development/MVP phase
- **Data:** 56 AI ideas + 3 CEO agents + token holdings
- **Location:** `/database/ai_company.db`

## Phase 1: SQLite → Production Ready
**Timeline:** Now - 1K users
**Storage:** Local SQLite file
**Capacity:** ~100GB, ~1K concurrent users

### What we'll do:
- ✅ Add missing API endpoints
- ✅ Connect frontend to real data
- ✅ Add database backups
- ✅ Add connection pooling

```javascript
// Database backup strategy
const backupDb = () => {
  const backup = new sqlite3.Database('backup.db');
  db.backup(backup);
};
```

## Phase 2: PostgreSQL Migration
**Timeline:** 1K - 100K users
**Storage:** Dedicated PostgreSQL server
**Capacity:** Unlimited, better performance

### Migration steps:
1. **Export SQLite data**
```bash
sqlite3 ai_company.db .dump > migration.sql
```

2. **Convert to PostgreSQL**
```sql
-- Convert SQLite to PostgreSQL syntax
-- Change AUTOINCREMENT → SERIAL
-- Update data types
```

3. **Deploy with Docker**
```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ai_company
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
  
  app:
    build: .
    environment:
      DATABASE_URL: postgres://admin:${DB_PASSWORD}@postgres:5432/ai_company
```

## Phase 3: Supabase/Cloud Scale
**Timeline:** 100K+ users
**Storage:** Cloud PostgreSQL + real-time
**Capacity:** Global scale, auto-scaling

### Migration to Supabase:
1. **Create Supabase project**
2. **Migrate PostgreSQL data**
3. **Add real-time features**
4. **Enable Row Level Security (RLS)**

```sql
-- Enable RLS for security
ALTER TABLE ceo_agents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see published agents
CREATE POLICY "Public agents visible" ON ceo_agents
  FOR SELECT USING (status = 'available');

-- Policy: Users can only edit their own agents
CREATE POLICY "Users edit own agents" ON ceo_agents
  FOR UPDATE USING (creator_wallet = auth.uid());
```

## Data Persistence Guarantee

### Current (SQLite):
- **File location:** `/database/ai_company.db`
- **Backup:** Manual file copy
- **Persistence:** As long as file exists

### Production (PostgreSQL):
- **Backup:** Automated daily backups
- **Persistence:** Redundant storage, WAL logging
- **Recovery:** Point-in-time recovery

### Cloud (Supabase):
- **Backup:** Automatic, multiple regions
- **Persistence:** 99.9% uptime SLA
- **Recovery:** Instant failover

## Migration Timeline

```
Current: SQLite (312KB)
   ↓ (when we hit 1K users)
Phase 2: PostgreSQL 
   ↓ (when we hit 100K users)  
Phase 3: Supabase Cloud
```

## Data Safety During Migration

1. **SQLite → PostgreSQL**
   - Export all data first
   - Test migration on copy
   - Verify data integrity
   - Switch DNS when ready

2. **PostgreSQL → Supabase**
   - Use Supabase migration tools
   - Parallel sync during transition
   - Zero-downtime migration

## Cost Comparison

| Phase | Users | Monthly Cost | Database |
|-------|-------|-------------|----------|
| 1. SQLite | 0-1K | $0 | Local file |
| 2. PostgreSQL | 1K-100K | $20-200 | Dedicated server |
| 3. Supabase | 100K+ | $25+ | Managed cloud |

## Current Action Plan

**RIGHT NOW:** Let's build the API endpoints for SQLite!
**LATER:** We'll migrate when we need to scale.

Your data is 100% safe in SQLite for now. When we grow, migration is straightforward! 🚀
