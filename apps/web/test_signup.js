const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dthkkgkxjahydnsfpupg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGtrZ2t4amFoeWRuc2ZwdXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjMxNTcsImV4cCI6MjEwMjkzOTE1N30.5zB1MZlQJ_gLiqKc6RbkNso2HBeJwzQlpwNVWlz7OgM');
async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_user_' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: { full_name: 'Test', role: 'USER' }
    }
  });
  console.log(error ? error.message : 'Success: ' + data.user.id);
}
test();
