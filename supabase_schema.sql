-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to cleanly apply the new structure 
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS company_time_slots CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 1. Companies Table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    phone TEXT,
    address TEXT,
    description TEXT,
    payment_proof TEXT,
    subscription_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'inactive'
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table (Handles all Authentication)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Plaintext for prototype purposes
    is_admin BOOLEAN DEFAULT FALSE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Company Availability Table (Time Slots controlled by the company)
CREATE TABLE company_time_slots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    time_slot TEXT NOT NULL, -- e.g. "09:00 AM"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, time_slot)
);

-- 3.5. Company Blocked Dates
CREATE TABLE company_blocked_dates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    blocked_date TEXT NOT NULL, -- "YYYY-MM-DD" natively as text to match server.js formatDate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, blocked_date)
);

-- 4. Meetings Table
CREATE TABLE meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_details JSONB NOT NULL, -- {name, email, phone, gender, members, reason}
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pre-seed a Master Admin user for testing
INSERT INTO users (name, email, password, is_admin)
VALUES ('Master Admin', 'admin@schedulr.com', 'admin123', TRUE);
