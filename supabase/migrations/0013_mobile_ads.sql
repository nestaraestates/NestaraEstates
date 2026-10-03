CREATE TABLE public.mobile_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_number INTEGER NOT NULL UNIQUE CHECK (slot_number BETWEEN 1 AND 4),
    image_url TEXT NOT NULL,
    redirect_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Security Policies
ALTER TABLE public.mobile_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mobile_ads" ON public.mobile_ads FOR SELECT USING (true);
CREATE POLICY "Admin all mobile_ads" ON public.mobile_ads FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('ADMIN', 'SUPER_ADMIN')));

-- Storage Bucket for Ad Images
INSERT INTO storage.buckets (id, name, public) VALUES ('ads', 'ads', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Access Ads" ON storage.objects FOR SELECT USING (bucket_id = 'ads');
CREATE POLICY "Auth Upload Ads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ads' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Ads" ON storage.objects FOR DELETE USING (bucket_id = 'ads' AND auth.role() = 'authenticated');
