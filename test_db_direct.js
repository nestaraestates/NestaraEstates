const { createClient } = require('@supabase/supabase-js');
const url = 'https://dthkkgkxjahydnsfpupg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGtrZ2t4amFoeWRuc2ZwdXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjMxNTcsImV4cCI6MjEwMjkzOTE1N30.5zB1MZlQJ_gLiqKc6RbkNso2HBeJwzQlpwNVWlz7OgM';
const supabase = createClient(url, key);

async function inspect() {
  const propId = 'cd4f0d58-d6fa-4fd8-a77f-7cbd43f8a61c';
  console.log("Inspecting Property:", propId);
  
  const { data: media, error: mediaErr } = await supabase.from('property_media').select('*').eq('property_id', propId);
  console.log("Media:", media, mediaErr);
  
  const { data: verifs, error: verifErr } = await supabase.from('verifications').select('*').eq('property_id', propId);
  console.log("Verifications:", verifs, verifErr);
  
  const { data: enqs, error: enqErr } = await supabase.from('enquiries').select('*').eq('property_id', propId);
  console.log("Enquiries:", enqs, enqErr);
  
  // Since we don't have the JWT, we can't test delete. 
  // Let's just check if there is any other table referencing it by fetching from all known tables.
}
inspect();
