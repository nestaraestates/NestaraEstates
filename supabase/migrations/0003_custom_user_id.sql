-- Create a sequence for the custom IDs
CREATE SEQUENCE IF NOT EXISTS user_custom_id_seq START 1;

-- Add the custom_id column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_id VARCHAR(11) UNIQUE;

-- Create a function to assign the custom_id automatically
CREATE OR REPLACE FUNCTION assign_custom_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_id IS NULL THEN
    NEW.custom_id := 'N' || LPAD(nextval('user_custom_id_seq')::text, 10, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign custom_id before insert
DROP TRIGGER IF EXISTS trigger_assign_custom_id ON public.profiles;
CREATE TRIGGER trigger_assign_custom_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION assign_custom_id();

-- Backfill existing profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE custom_id IS NULL LOOP
    UPDATE public.profiles 
    SET custom_id = 'N' || LPAD(nextval('user_custom_id_seq')::text, 10, '0') 
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- Make custom_id NOT NULL after backfilling
ALTER TABLE public.profiles ALTER COLUMN custom_id SET NOT NULL;
