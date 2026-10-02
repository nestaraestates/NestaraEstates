# Nestara Estates: Emergency Database SQL Cheat Sheet
*Keep this document safe. These commands will permanently modify your Supabase database.*

## 1. Delete Unwanted/Spam Test Users
If AI bots or testers spam your database, run this to securely wipe all accounts ending in "@test.com":
```sql
DELETE FROM auth.users WHERE email ILIKE '%@test.com';
```

## 2. Force-Delete a Specific User (by Email)
If a user is violating terms and you need them gone instantly:
```sql
DELETE FROM auth.users WHERE email = 'spammer@example.com';
```

## 3. Force-Delete a Property (Bypass 7-Day Wait)
If you need to instantly wipe a property (and all its chats/images) right now without waiting 7 days:
```sql
-- Replace 'PROPERTY-UUID-HERE' with the actual property ID
DELETE FROM public.properties WHERE id = 'PROPERTY-UUID-HERE';
```

## 4. Un-Ban a Suspended User
If a user was accidentally banned from the Admin Panel, restore their account:
```sql
-- Assuming you have their ID. If you only have their email, use the users table:
UPDATE public.profiles 
SET account_status = 'ACTIVE' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

## 5. Manually Trigger the 7-Day Cleanup NOW
If you don't want to wait until midnight to clear out deleted/sold properties, run this manually:
```sql
DELETE FROM public.properties 
WHERE status IN ('SOLD', 'CLOSED', 'DELETED') 
AND updated_at < NOW() - INTERVAL '7 days';
```
