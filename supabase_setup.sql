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
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (Select and Insert)
CREATE POLICY "Allow public read access" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.app_users FOR UPDATE USING (true);

-- Create system_logs table to persist application events
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for system_logs
CREATE POLICY "Allow public read access" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.system_logs FOR INSERT WITH CHECK (true);

-- =====================================================================
-- SQL Script to create the admins table in Supabase
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Plain text password for test environment
    first_name TEXT DEFAULT 'Surendra',
    last_name TEXT DEFAULT 'Bezawada',
    profile_pic TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies to allow read access and updating credentials
CREATE POLICY "Allow public read-only verification" 
ON public.admins 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public update access" 
ON public.admins 
FOR UPDATE 
USING (true);

-- Seed the admin login details (username: Surendra@admin, password: Admin@123)
INSERT INTO public.admins (username, password, first_name, last_name)
VALUES ('Surendra@admin', 'Admin@123', 'Surendra', 'Bezawada')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password;

-- =====================================================================
-- SQL Script to create the drivers table in Supabase
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Plain text password for developer testing environment context
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    vehicle_type TEXT DEFAULT 'car', -- 'car', 'bike', 'auto'
    vehicle_number TEXT,
    license_number TEXT,
    profile_pic TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'active', 'inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies to allow reading and updates
CREATE POLICY "Allow public read-only access for drivers" 
ON public.drivers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access for drivers" 
ON public.drivers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access for drivers" 
ON public.drivers 
FOR UPDATE 
USING (true);

-- Seed a test driver (email: test@driver.com, password: Driver@123)
INSERT INTO public.drivers (email, password, first_name, last_name, phone, vehicle_type, vehicle_number, license_number, status)
VALUES ('test@driver.com', 'Driver@123', 'John', 'Driver', '9876543210', 'car', 'AP-09-XX-1234', 'DL-9876543210', 'approved')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password;

