-- Upgrade the hardcoded Super Admin accounts so they bypass RLS correctly
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE email IN ('nestaraestates@gmail.com', 'vineethbpawar@gmail.com');
