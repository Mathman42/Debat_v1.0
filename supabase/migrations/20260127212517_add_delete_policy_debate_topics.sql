/*
  # Add DELETE Policy for Debate Topics

  1. Security Changes
    - Add DELETE policy for `debate_topics` table to allow public deletion
    - This allows the application to refresh/replace topics as needed

  ## Notes
  - This is needed for the "Vervang alle onderwerpen" functionality
  - Since this is an educational tool and topics are regenerated via AI, public delete access is acceptable
*/

-- Add DELETE policy for debate_topics
CREATE POLICY "Anyone can delete debate topics"
  ON debate_topics
  FOR DELETE
  TO public
  USING (true);
