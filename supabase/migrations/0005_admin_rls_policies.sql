-- Safely drop existing policies just in case they were using the lowercase 'admin' bug
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;

-- Recreate UPDATE Policy with correct uppercase role check
CREATE POLICY "Admins can update any property"
ON public.properties FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
);

-- Recreate DELETE Policy with correct uppercase role check
CREATE POLICY "Admins can delete any property"
ON public.properties FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
);
