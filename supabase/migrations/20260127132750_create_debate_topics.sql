/*
  # DebatCoach Database Schema

  1. New Tables
    - `debate_topics`
      - `id` (uuid, primary key)
      - `title` (text) - The debate topic/statement
      - `description` (text) - Brief description of what the topic is about
      - `category` (text) - Category like 'school', 'maatschappij', 'technologie'
      - `is_sensitive` (boolean) - Flag for sensitive topics requiring special handling
      - `created_at` (timestamptz)
    
    - `debate_sessions`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to debate_topics)
      - `standpoint` (text) - 'VOOR' or 'TEGEN'
      - `messages` (jsonb) - Array of messages in the debate
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Public read access for topics
    - Sessions are accessible to everyone (educational tool)

  3. Initial Data
    - Pre-populate common debate topics for Dutch secondary education
*/

-- Create debate_topics table
CREATE TABLE IF NOT EXISTS debate_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text DEFAULT 'algemeen',
  is_sensitive boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create debate_sessions table
CREATE TABLE IF NOT EXISTS debate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES debate_topics(id) ON DELETE CASCADE,
  standpoint text NOT NULL CHECK (standpoint IN ('VOOR', 'TEGEN')),
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE debate_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for debate_topics (public read)
CREATE POLICY "Anyone can read debate topics"
  ON debate_topics
  FOR SELECT
  TO public
  USING (true);

-- Policies for debate_sessions (public access for educational purposes)
CREATE POLICY "Anyone can create debate sessions"
  ON debate_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read debate sessions"
  ON debate_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update debate sessions"
  ON debate_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert sample debate topics
INSERT INTO debate_topics (title, description, category, is_sensitive) VALUES
  ('De overheid moet het gebruik van sociale media voor jongeren onder de 16 jaar wettelijk verbieden.', 'Deze stelling dwingt leerlingen na te denken over de balans tussen de bescherming van de mentale gezondheid van jongeren en hun recht op individuele vrijheid en digitale toegang.', 'technologie', false),
  ('Schooluniformen moeten verplicht worden op alle middelbare scholen.', 'Debat over gelijkheid, individualiteit en praktische voordelen van uniforme kleding op school.', 'school', false),
  ('Huiswerk moet worden afgeschaft.', 'Discussie over de effectiviteit van huiswerk en de balans tussen school en vrije tijd.', 'school', false),
  ('Nederland moet kernenergie gebruiken om klimaatdoelen te halen.', 'Debat over duurzame energie, veiligheid en klimaatverandering.', 'milieu', false),
  ('De stemgerechtigde leeftijd moet worden verlaagd naar 16 jaar.', 'Discussie over jongeren en democratische participatie.', 'maatschappij', false),
  ('Vlees eten moet ontmoedigd worden door hogere belastingen.', 'Debat over gezondheid, milieu en persoonlijke vrijheid.', 'milieu', false),
  ('Smartphones moeten verboden worden tijdens schooltijd.', 'Discussie over afleiding, leermiddelen en zelfregulering.', 'school', false),
  ('Influencers moeten een vergunning hebben om producten aan te prijzen.', 'Debat over consumentenbescherming en vrijheid van meningsuiting.', 'technologie', false)
ON CONFLICT DO NOTHING;