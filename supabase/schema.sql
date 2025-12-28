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

-- User activities table (customizable activities per user)
CREATE TABLE user_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  category VARCHAR(50) NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique activity names per user
  UNIQUE(user_id, name)
);

-- Indexes for user_activities
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);

-- RLS Policies for user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON user_activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON user_activities FOR DELETE
  USING (auth.uid() = user_id);

-- User screen time conversions table (customizable conversion tiers per user)
CREATE TABLE user_screen_time_conversions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_screen_time_conversions
CREATE INDEX idx_user_screen_time_conversions_user_id ON user_screen_time_conversions(user_id);

-- RLS Policies for user_screen_time_conversions
ALTER TABLE user_screen_time_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversions"
  ON user_screen_time_conversions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions"
  ON user_screen_time_conversions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversions"
  ON user_screen_time_conversions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversions"
  ON user_screen_time_conversions FOR DELETE
  USING (auth.uid() = user_id);

-- User subscriptions table (Premium feature)
CREATE TABLE user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_source VARCHAR(20) DEFAULT 'manual', -- 'manual', 'google_play', 'app_store'
  subscription_id VARCHAR(255), -- Store subscription ID (future)
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = lifetime/manual
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick premium checks
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- RLS Policies for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
