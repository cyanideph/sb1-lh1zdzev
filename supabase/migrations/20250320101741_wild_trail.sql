/*
  # Initial Schema Setup for Smart Uzzap Modern

  1. New Tables
    - `profiles`
      - User profiles with avatars and online status
    - `chatrooms`
      - Regional chatrooms with province categorization
    - `messages`
      - Chat messages with support for text and images
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now()
);

-- Create chatrooms table
CREATE TABLE IF NOT EXISTS chatrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  region text NOT NULL,
  province text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  chatroom_id uuid REFERENCES chatrooms(id) ON DELETE CASCADE,
  type text DEFAULT 'text' CHECK (type IN ('text', 'image')),
  image_url text
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Chatrooms policies
CREATE POLICY "Chatrooms are viewable by everyone"
  ON chatrooms FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create chatrooms"
  ON chatrooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Messages policies
CREATE POLICY "Messages are viewable by everyone"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = user_id);