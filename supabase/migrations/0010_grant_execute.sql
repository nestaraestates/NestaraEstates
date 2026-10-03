-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_hard_delete_property(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_hard_delete_property(UUID) TO anon;

-- Redefine the function to bypass the custom storage trigger
CREATE OR REPLACE FUNCTION admin_hard_delete_property(prop_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Temporarily disable triggers (this bypasses the custom storage.objects trigger that crashes)
    SET LOCAL session_replication_role = 'replica';
    
    -- Manually delete from child tables since CASCADE system triggers are also disabled in replica mode
    DELETE FROM public.property_media WHERE property_id = prop_id;
    DELETE FROM public.verifications WHERE property_id = prop_id;
    DELETE FROM public.enquiries WHERE property_id = prop_id;
    
    -- Now delete the main property
    DELETE FROM public.properties WHERE id = prop_id;
    
    -- Restore normal trigger behavior
    SET LOCAL session_replication_role = 'origin';
END;
$$;
