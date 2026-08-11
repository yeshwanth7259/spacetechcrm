const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeAdmin() {
  console.log('Updating all users to super_admin...');
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .neq('role', 'super_admin'); // Update everyone who isn't already a super_admin
    
  if (error) {
    console.error('Error updating profiles:', error);
  } else {
    console.log('Successfully updated profiles!');
  }
}

makeAdmin();
