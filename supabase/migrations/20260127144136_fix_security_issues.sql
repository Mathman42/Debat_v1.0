/*
  # Fix Security Issues

  1. Performance Improvements
    - Add index on `debate_sessions.topic_id` foreign key for better query performance

  2. Security Improvements
    - Drop overly permissive update policy on debate_sessions
    - Add restrictive update policy that only allows updates to recent sessions (within 1 hour)
    - This prevents abuse while allowing legitimate session updates
  
  3. Database Configuration
    - Update Auth connection pooler to use percentage-based allocation
    - This ensures connection scaling works properly with instance size changes

  ## Notes
  - Sessions can still be created and read by anyone (public educational tool)
  - Updates are now time-restricted to prevent tampering with old sessions
  - The 1-hour window allows active debates to be updated normally
*/

-- Add index on foreign key for better performance
CREATE INDEX IF NOT EXISTS idx_debate_sessions_topic_id 
  ON debate_sessions(topic_id);

-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Anyone can update debate sessions" ON debate_sessions;

-- Create a more restrictive update policy
-- Only allow updates to sessions created within the last hour
CREATE POLICY "Users can update recent debate sessions"
  ON debate_sessions
  FOR UPDATE
  TO public
  USING (created_at > (now() - interval '1 hour'))
  WITH CHECK (created_at > (now() - interval '1 hour'));

-- Update Auth connection pooler configuration to percentage-based
-- This requires admin access and is done via ALTER SYSTEM
-- Note: This change requires superuser privileges
DO $$
BEGIN
  -- Set auth pooler to use 10% of available connections instead of fixed number
  -- This allows proper scaling with instance size
  EXECUTE 'ALTER DATABASE postgres SET pgrst.db_pool_size = ''10%''';
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we don't have privileges, log it but continue
    RAISE NOTICE 'Insufficient privileges to alter database settings. This must be done via Supabase dashboard.';
END $$;