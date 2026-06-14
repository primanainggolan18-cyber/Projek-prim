-- Create storage bucket for berkas (uploaded files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('berkas', 'berkas', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to berkas bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'berkas');

-- Allow public read from berkas bucket
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'berkas');

-- Allow admin delete from berkas bucket
CREATE POLICY "Allow admin delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'berkas' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'lurah', 'operator')
    )
  );