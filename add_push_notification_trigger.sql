-- Create a function to notify all users about a new property
CREATE OR REPLACE FUNCTION notify_new_property()
RETURNS trigger AS $$
BEGIN
  -- Insert a notification for all users except the owner
  INSERT INTO public.notifications (user_id, title, content)
  SELECT 
    id, 
    'New Property Listed', 
    'A new ' || NEW.type || ' is available for ' || NEW.purpose || ' in ' || NEW.city || '!'
  FROM public.profiles
  WHERE id != NEW.owner_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the properties table
DROP TRIGGER IF EXISTS on_property_added ON public.properties;
CREATE TRIGGER on_property_added
AFTER INSERT ON public.properties
FOR EACH ROW
EXECUTE FUNCTION notify_new_property();
