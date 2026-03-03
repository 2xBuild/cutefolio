-- Add hit_count column (existing rows default to 1 hit each)
ALTER TABLE analytics_events ADD COLUMN hit_count integer NOT NULL DEFAULT 1;

-- Merge duplicate rows that share the same session+app+event+path+link.
-- Keep the row with the lowest id and accumulate the count.
WITH groups AS (
  SELECT
    MIN(id) AS survivor_id,
    COUNT(*) AS total
  FROM analytics_events
  GROUP BY COALESCE(session_hash, ''), app_id, event_type, path, COALESCE(link_id, '')
  HAVING COUNT(*) > 1
)
UPDATE analytics_events e
SET hit_count = g.total
FROM groups g
WHERE e.id = g.survivor_id;

-- Remove all non-survivor duplicates
WITH survivors AS (
  SELECT MIN(id) AS id
  FROM analytics_events
  GROUP BY COALESCE(session_hash, ''), app_id, event_type, path, COALESCE(link_id, '')
)
DELETE FROM analytics_events
WHERE id NOT IN (SELECT id FROM survivors);

-- Unique index used as the ON CONFLICT target for upserts
CREATE UNIQUE INDEX analytics_events_dedup_idx
  ON analytics_events (COALESCE(session_hash, ''), app_id, event_type, path, COALESCE(link_id, ''));
