# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - **Name**: astral-ai-agent
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to Brazil (e.g., South America)
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Get API Credentials

Once project is created:

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values to your `.env`:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (click "Reveal" first)

## Step 3: Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file: `supabase/migrations/001_initial_schema.sql`
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click "Run" (bottom right)
7. You should see: "Success. No rows returned"

## Step 4: Verify Tables Created

1. Go to **Table Editor** in left sidebar
2. You should see these tables:
   - conversations
   - messages
   - message_bursts
   - agent_decisions
   - chatwoot_knowledge

If you see all 5 tables, you're done with Supabase setup! ✅

## Update .env File

Your `.env` should now have:
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
