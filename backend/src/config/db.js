// Supabase client — will be replaced by real implementation
// Stub file so imports resolve during testing
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || 'http://localhost',
    process.env.SUPABASE_SERVICE_KEY || 'stub-key'
);

module.exports = supabase;
