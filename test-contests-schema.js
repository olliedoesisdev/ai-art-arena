require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContestsSchema() {
  console.log('Testing contests table schema...\n');

  try {
    // Try to select from contests table
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Sample contest record columns:', Object.keys(data[0]));
      console.log('\nSample contest data:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('No contests in table yet.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testContestsSchema();
