-- SQL Script to create the app_users table in Supabase
-- Copy and run this script in your Supabase project SQL Editor:
-- https://supabase.com/dashboard/project/dwqloetzajasjjpwqsws/sql/new

DROP TABLE IF EXISTS public.app_users CASCADE;

CREATE TABLE public.app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_pic TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT,
  pin_code TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Select and Insert)
CREATE POLICY "Allow public read access" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.app_users FOR UPDATE USING (true);
