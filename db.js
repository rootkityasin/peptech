const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);

  async function testConnection() {
    try {
      const { data, error } = await supabase.from('user').select('*').limit(1);
      if (error) {
        console.warn('[Supabase] Warning querying user table:', error.message);
      } else {
        console.log('[Supabase] Connected to user table! Found rows:', data?.length ?? 0);
      }
    } catch (err) {
      console.warn('[Supabase] Connection test caught:', err.message);
    }
  }

  testConnection();
}

module.exports = supabase;
