const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'd:/project01/tms-project1/backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('Projects').select('*').limit(1);
  if (error) {
    console.log("Error querying Projects:", error.message);
  } else {
    console.log("Projects table exists:", data);
  }
}

checkSchema();
