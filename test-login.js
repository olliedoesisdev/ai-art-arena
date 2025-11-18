// Test login with Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\nTesting Supabase connection and login...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('\nMissing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  // Test connection
  console.log('\nTesting database connection...');
  const { data: contests, error: connError } = await supabase
    .from('contests')
    .select('count')
    .limit(1);

  if (connError) {
    console.error('Database connection error:', connError.message);
    return;
  }

  console.log('Database connection: OK');

  // Test admin_users table
  console.log('\nTesting admin_users table...');
  const { data: adminUsers, error: adminError } = await supabase
    .from('admin_users')
    .select('email, role, is_active')
    .limit(5);

  if (adminError) {
    console.error('Admin users table error:', adminError.message);
    console.error('Error details:', adminError);
    return;
  }

  console.log('Admin users table: OK');
  console.log('Found', adminUsers.length, 'admin users');

  console.log('\nYou can test login manually:');
  console.log('1. Make sure dev server is running: npm run dev');
  console.log('2. Go to: http://localhost:3000/admin/login');
  console.log('3. Login with: olliedoesis.dev@gmail.com');
  console.log('4. Use the password you set when creating the account');
}

testLogin().catch(err => {
  console.error('\nUnexpected error:', err.message);
  console.error(err);
});
