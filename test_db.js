const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('/home/vini/projects122/NestaraEstates/apps/mobile/.env', 'utf8');
const url = env.match(/EXPO_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('profiles').select('preferred_cities, address').limit(1);
  console.log(data, error);
}
test();
