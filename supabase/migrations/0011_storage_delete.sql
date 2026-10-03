-- Allow authenticated users to delete media from storage
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
