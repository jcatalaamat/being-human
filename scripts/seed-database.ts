#!/usr/bin/env ts-node

/**
 * Seed the Supabase database with initial course data
 * Run with: npx tsx scripts/seed-database.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

async function seedDatabase() {
  console.log('🌱 Seeding database...\n')

  try {
    // Read seed SQL file
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql')
    const seedSQL = fs.readFileSync(seedPath, 'utf-8')

    console.log('📂 Reading seed file:', seedPath)
    console.log('📏 File size:', seedSQL.length, 'characters\n')

    // Execute SQL using RPC
    console.log('⚙️  Executing seed SQL...')

    // Since we can't execute raw SQL with anon key, we'll need to use the Supabase dashboard
    // OR create a function in Supabase. For now, let's provide instructions:

    console.log('\n📋 MANUAL SEEDING INSTRUCTIONS:')
    console.log('═'.repeat(60))
    console.log('1. Go to: https://vpdwubpodcrbicvldskg.supabase.co')
    console.log('2. Navigate to: SQL Editor (left sidebar)')
    console.log('3. Click: "New Query"')
    console.log('4. Copy the contents of: supabase/seed.sql')
    console.log('5. Paste into SQL Editor')
    console.log('6. Click: "Run" (or press Cmd/Ctrl + Enter)')
    console.log('═'.repeat(60))
    console.log('\nOR use this command:')
    console.log('\n  cat supabase/seed.sql | pbcopy')
    console.log('\nThis copies the seed SQL to your clipboard!\n')

    // Show preview of what will be seeded
    console.log('📚 What will be seeded:')
    console.log('  • 3 Courses (React, TypeScript, React Native)')
    console.log('  • 6 Modules')
    console.log('  • 13 Lessons (video, audio, text, PDF types)')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedDatabase()
