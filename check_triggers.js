const { createClient } = require('@supabase/supabase-js');
const url = 'https://dthkkgkxjahydnsfpupg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGtrZ2t4amFoeWRuc2ZwdXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjMxNTcsImV4cCI6MjEwMjkzOTE1N30.5zB1MZlQJ_gLiqKc6RbkNso2HBeJwzQlpwNVWlz7OgM';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.rpc('admin_hard_delete_property', { prop_id: 'cd4f0d58-d6fa-4fd8-a77f-7cbd43f8a61c' });
  console.log(data, error);
}
check();
