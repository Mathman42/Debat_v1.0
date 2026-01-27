/*
  # Add turn limit and summary to debate sessions

  1. Changes
    - Add `turn_limit` column to debate_sessions (integer, default 5)
    - Add `summary` column to debate_sessions (jsonb, nullable)
    - Add `completed` column to debate_sessions (boolean, default false)
  
  2. Notes
    - These fields allow tracking debate configuration and results
    - Summary stores the final performance analysis
    - Completed flag indicates if the debate finished normally
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debate_sessions' AND column_name = 'turn_limit'
  ) THEN
    ALTER TABLE debate_sessions ADD COLUMN turn_limit integer DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debate_sessions' AND column_name = 'summary'
  ) THEN
    ALTER TABLE debate_sessions ADD COLUMN summary jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'debate_sessions' AND column_name = 'completed'
  ) THEN
    ALTER TABLE debate_sessions ADD COLUMN completed boolean DEFAULT false;
  END IF;
END $$;
