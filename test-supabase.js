require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1️⃣  Testing basic connection...');
    const { data, error } = await supabase.from('contests').select('count');

    if (error) {
      if (error.code === '42P01') {
        console.log('   ⚠️  Tables not found - Need to run supabase-schema.sql');
        console.log('   ℹ️  Go to Supabase Dashboard → SQL Editor → Run supabase-schema.sql\n');
        return;
      }
      throw error;
    }

    console.log('   ✅ Connection successful!\n');

    // Test 2: Check for tables
    console.log('2️⃣  Checking for required tables...');
    const tables = ['contests', 'artworks', 'votes'];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`   ❌ Table '${table}' not found`);
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }

    console.log('\n3️⃣  Checking for active contest...');
    const { data: activeContest, error: contestError } = await supabase
      .rpc('get_active_contest');

    if (contestError) {
      console.log('   ⚠️  Function get_active_contest() not found');
      console.log('   ℹ️  Need to run supabase-schema.sql to create database functions');
    } else if (!activeContest || activeContest.length === 0) {
      console.log('   ℹ️  No active contest found');
      console.log('   💡 Create one using create-test-contest.sql');
    } else {
      console.log(`   ✅ Active contest: ${activeContest[0]?.title || 'Found'}`);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
