// Add or update admin user in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdminUser() {
  console.log('\n🔧 Adding/updating admin user: olliedoesis.dev@gmail.com\n');

  // Get auth user
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching auth users:', authError.message);
    return;
  }

  const targetEmail = 'olliedoesis.dev@gmail.com';
  const authUser = authUsers.users.find(u => u.email === targetEmail);

  if (!authUser) {
    console.log(`❌ User ${targetEmail} does not exist in auth.users`);
    console.log('\n📝 Please create the user first:');
    console.log('   Option 1: Go to http://localhost:3000/admin/signup');
    console.log('   Option 2: Create user in Supabase Dashboard > Authentication > Users');
    return;
  }

  console.log(`✅ Found auth user: ${authUser.id}`);

  // Insert or update admin_users
  const { data, error } = await supabase
    .from('admin_users')
    .upsert({
      id: authUser.id,
      email: authUser.email,
      name: 'Oliver White',
      role: 'admin',
      is_active: true,
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error adding admin user:', error.message);
    return;
  }

  console.log('\n✅ Admin user added/updated successfully!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Email: ${data.email}`);
  console.log(`   Name: ${data.name}`);
  console.log(`   Role: ${data.role}`);
  console.log(`   Active: ${data.is_active}`);
  console.log('\n🎉 You can now login at: http://localhost:3000/admin/login');
}

addAdminUser().catch(console.error);
