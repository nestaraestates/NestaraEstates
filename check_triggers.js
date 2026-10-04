const { createClient } = require('@supabase/supabase-js');
const url = 'https://dthkkgkxjahydnsfpupg.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGtrZ2t4amFoeWRuc2ZwdXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjMxNTcsImV4cCI6MjEwMjkzOTE1N30.5zB1MZlQJ_gLiqKc6RbkNso2HBeJwzQlpwNVWlz7OgM';
// wait, I can't query pg_trigger with anon key.
