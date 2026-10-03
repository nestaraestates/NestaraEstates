CREATE TABLE IF NOT EXISTS public.debug_policies AS SELECT * FROM pg_policies;
ALTER TABLE public.debug_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view debug" ON public.debug_policies FOR SELECT USING (true);
