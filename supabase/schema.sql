-- XPCombinado Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Children table
CREATE TABLE children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily records table
CREATE TABLE daily_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  activity_id VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one record per activity per child per day
  UNIQUE(child_id, activity_id, date)
);

-- Indexes for better query performance
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_daily_records_child_date ON daily_records(child_id, date);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- Children policies
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- Daily records policies
CREATE POLICY "Users can view daily records of their children"
  ON daily_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = daily_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert daily records for their children"
  ON daily_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = daily_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update daily records of their children"
  ON daily_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = daily_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete daily records of their children"
  ON daily_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = daily_records.child_id
      AND children.user_id = auth.uid()
    )
  );
