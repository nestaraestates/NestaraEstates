-- Drop if exists just in case
DROP POLICY IF EXISTS "Admins can delete property media" ON public.property_media;
DROP POLICY IF EXISTS "Admins can delete verifications" ON public.verifications;
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;

-- Allow Admins to delete dependent records during CASCADE
CREATE POLICY "Admins can delete property media"
ON public.property_media FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
);

CREATE POLICY "Admins can delete verifications"
ON public.verifications FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
);

CREATE POLICY "Admins can delete enquiries"
ON public.enquiries FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
);
