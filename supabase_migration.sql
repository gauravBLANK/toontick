-- Create user_library table for storing user's manhwa library
CREATE TABLE IF NOT EXISTS user_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manhwa_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'on_hold', 'dropped', 'plan_to_read')),
  chapters INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  average_score DECIMAL(3,1),
  popularity INTEGER,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can't have duplicate manhwa in their library
  UNIQUE(user_id, manhwa_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_manhwa_id ON user_library(manhwa_id);
CREATE INDEX IF NOT EXISTS idx_user_library_created_at ON user_library(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own library items
CREATE POLICY "Users can view their own library" ON user_library
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own library items
CREATE POLICY "Users can insert their own library items" ON user_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own library items
CREATE POLICY "Users can update their own library items" ON user_library
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own library items
CREATE POLICY "Users can delete their own library items" ON user_library
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_library_updated_at
  BEFORE UPDATE ON user_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();