try {
  if (process.loadEnvFile) {
    process.loadEnvFile();
  }
} catch (e) {
  // .env will be read from environment variables if not present as a file
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseApiKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_API_KEY is missing in environment variables.');
}

const supabase = createClient(supabaseUrl || '', supabaseApiKey || '');

// Test the connection
if (supabaseUrl && supabaseApiKey) {
  supabase
    .from('product')
    .select('id, title, handle, status')
    .limit(3)
    .then(({ data, error }) => {
      if (error) console.error('Connection error:', error);
      else console.log('Connected to Supabase successfully. Sample products:', data);
    });
}

module.exports = supabase;
