// Check if admin user exists in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUser() {
  console.log('\nChecking for admin user: olliedoesis.dev@gmail.com\n');

  // Check if user exists in auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching auth users:', authError.message);
    return;
  }

  const targetEmail = 'olliedoesis.dev@gmail.com';
  const authUser = authUsers.users.find(u => u.email === targetEmail);

  if (!authUser) {
    console.log('User does not exist in auth.users');
    console.log('\nNext Steps:');
    console.log('1. Go to http://localhost:3000/admin/signup');
    console.log('2. Sign up with: olliedoesis.dev@gmail.com');
    console.log('3. Then run: node add-admin-user.js');
    return;
  }

  console.log('Auth user found:');
  console.log('   ID:', authUser.id);
  console.log('   Email:', authUser.email);
  console.log('   Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');

  // Check if user exists in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (adminError || !adminUser) {
    console.log('\nUser NOT in admin_users table');
    console.log('\nTo fix, run: node add-admin-user.js');
    return;
  }

  console.log('\nAdmin user found:');
  console.log('   Role:', adminUser.role);
  console.log('   Active:', adminUser.is_active);
  console.log('   Name:', adminUser.name || 'Not set');

  if (!adminUser.is_active) {
    console.log('\nUser exists but is INACTIVE');
    console.log('   Run: node add-admin-user.js (to activate)');
  } else {
    console.log('\nEverything looks good! You should be able to login.');
    console.log('   Login at:', process.env.NEXT_PUBLIC_SITE_URL + '/admin/login');
  }
}

checkAdminUser().catch(console.error);
