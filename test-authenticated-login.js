// Test authenticated login flow
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testAuthenticatedLogin() {
  console.log('\n=== Testing Authenticated Login Flow ===\n');
  
  const email = 'olliedoesis.dev@gmail.com';
  console.log('Email:', email);
  
  const password = await question('Enter your password: ');
  console.log('\nAttempting login...\n');

  // Step 1: Sign in with password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    rl.close();
    return;
  }

  if (!authData.user) {
    console.error('❌ No user returned from auth');
    rl.close();
    return;
  }

  console.log('✅ Authentication successful!');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);

  // Step 2: Check if user is in admin_users table
  console.log('\nChecking admin_users table...');
  
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', authData.user.id)
    .eq('is_active', true)
    .single();

  if (adminError) {
    console.error('❌ Error querying admin_users:', adminError.message);
    console.error('   Error code:', adminError.code);
    console.error('   Details:', adminError.details);
    
    if (adminError.code === 'PGRST116') {
      console.error('\n⚠️  User not found in admin_users table!');
      console.error('   Run: node add-admin-user.js');
    }
  } else if (!adminUser) {
    console.error('❌ You do not have admin access');
  } else {
    console.log('✅ Admin access verified!');
    console.log('   Role:', adminUser.role);
    console.log('   Active:', adminUser.is_active);
    console.log('   Name:', adminUser.name);
    console.log('\n🎉 Login should work! Try logging in at: http://localhost:3000/admin/login');
  }

  // Sign out
  await supabase.auth.signOut();
  rl.close();
}

testAuthenticatedLogin().catch(err => {
  console.error('\n❌ Unexpected error:', err.message);
  rl.close();
});
