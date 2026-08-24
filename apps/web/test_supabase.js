const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://dthkkgkxjahydnsfpupg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGtrZ2t4amFoeWRuc2ZwdXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjMxNTcsImV4cCI6MjEwMjkzOTE1N30.5zB1MZlQJ_gLiqKc6RbkNso2HBeJwzQlpwNVWlz7OgM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'bhuvanbhaskarsvk@gmail.com');
  console.log('Data:', data);
  console.log('Error:', error);
}
checkUser();
