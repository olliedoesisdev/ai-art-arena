// Quick test to verify Supabase connection
// Run with: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🧪 Testing Supabase Connection...\n')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Supabase credentials not found in .env.local\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n📡 Attempting to connect to Supabase...')

    // Simple query to test connection
    const { data, error } = await supabase
      .from('contests')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.log('\n⚠️  Connection successful, but tables don\'t exist yet!')
        console.log('👉 You need to run supabase-schema.sql in Supabase SQL Editor')
        console.log('👉 Go to: https://uatmvggpkdsfdtjebcfs.supabase.co\n')
        return
      }
      throw error
    }

    console.log('\n✅ Supabase connection successful!')
    console.log('✅ Tables exist!')
    console.log('📊 Data:', data)

  } catch (err) {
    console.error('\n❌ Connection failed!')
    console.error('Error:', err.message)
    console.error('\nPossible issues:')
    console.error('1. Check your internet connection')
    console.error('2. Verify Supabase project is active')
    console.error('3. Check credentials in .env.local')
  }
}

testConnection()
