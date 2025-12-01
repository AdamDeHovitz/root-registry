-- Create table to track OCR corrections
CREATE TABLE IF NOT EXISTS root_ocr_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES root_games(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  original_data jsonb NOT NULL,
  corrected_data jsonb NOT NULL,
  fields_changed text[] NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

-- Add index for faster queries by game_id
CREATE INDEX IF NOT EXISTS idx_ocr_corrections_game_id ON root_ocr_corrections(game_id);

-- Add index for faster queries by created_at (for analysis over time)
CREATE INDEX IF NOT EXISTS idx_ocr_corrections_created_at ON root_ocr_corrections(created_at);
