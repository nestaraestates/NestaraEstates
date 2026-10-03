CREATE OR REPLACE FUNCTION admin_hard_delete_property(prop_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.properties WHERE id = prop_id;
END;
$$;
