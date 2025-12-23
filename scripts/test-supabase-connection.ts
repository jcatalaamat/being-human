#!/usr/bin/env ts-node

/**
 * Test Supabase connection and verify database setup
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  console.log(`📍 URL: ${SUPABASE_URL}`)
  console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`)

  try {
    // Test 1: Check if courses table exists
    console.log('1️⃣ Checking courses table...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(5)

    if (coursesError) {
      console.error('❌ Error querying courses:', coursesError.message)
      return false
    }

    console.log(`✅ Courses table exists`)
    console.log(`   Found ${courses?.length || 0} courses\n`)

    // Test 2: Check if modules table exists
    console.log('2️⃣ Checking modules table...')
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title')
      .limit(5)

    if (modulesError) {
      console.error('❌ Error querying modules:', modulesError.message)
      return false
    }

    console.log(`✅ Modules table exists`)
    console.log(`   Found ${modules?.length || 0} modules\n`)

    // Test 3: Check if lessons table exists
    console.log('3️⃣ Checking lessons table...')
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title')
      .limit(5)

    if (lessonsError) {
      console.error('❌ Error querying lessons:', lessonsError.message)
      return false
    }

    console.log(`✅ Lessons table exists`)
    console.log(`   Found ${lessons?.length || 0} lessons\n`)

    // Test 4: Check if progress tables exist
    console.log('4️⃣ Checking progress tables...')
    const { error: courseProgressError } = await supabase
      .from('user_course_progress')
      .select('id')
      .limit(1)

    const { error: lessonProgressError } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .limit(1)

    if (courseProgressError) {
      console.error('❌ Error querying user_course_progress:', courseProgressError.message)
      return false
    }

    if (lessonProgressError) {
      console.error('❌ Error querying user_lesson_progress:', lessonProgressError.message)
      return false
    }

    console.log(`✅ Progress tables exist\n`)

    // Summary
    console.log('═'.repeat(50))
    console.log('📊 DATABASE SUMMARY')
    console.log('═'.repeat(50))
    console.log(`Courses: ${courses?.length || 0}`)
    console.log(`Modules: ${modules?.length || 0}`)
    console.log(`Lessons: ${lessons?.length || 0}`)
    console.log('═'.repeat(50))

    if (courses?.length === 0) {
      console.log('\n💡 TIP: Your database is empty. Run seed data:')
      console.log('   1. Go to Supabase Dashboard → SQL Editor')
      console.log('   2. Copy contents of supabase/seed.sql')
      console.log('   3. Paste and run in SQL Editor')
    } else {
      console.log('\n✅ Database is connected and has data!')

      console.log('\n📚 Sample courses:')
      courses?.forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title} (${course.id})`)
      })
    }

    return true
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

// Run the test
testConnection()
  .then((success) => {
    if (success) {
      console.log('\n✅ Connection test passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Connection test failed!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
