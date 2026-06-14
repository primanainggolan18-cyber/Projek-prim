-- Add surat_generated table to store generated letters
CREATE TABLE IF NOT EXISTS public.surat_generated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengajuan_id uuid NOT NULL REFERENCES public.pengajuan(id) ON DELETE CASCADE,
  template_used text,
  konten_surat text NOT NULL,
  nomor_surat text,
  tanggal_surat date DEFAULT CURRENT_DATE,
  generated_at timestamptz DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),
  UNIQUE(pengajuan_id)
);

-- Add nomor_surat field to pengajuan for official letter numbering
ALTER TABLE public.pengajuan ADD COLUMN IF NOT EXISTS nomor_surat text;

-- Enable RLS on surat_generated
ALTER TABLE public.surat_generated ENABLE ROW LEVEL SECURITY;

-- Policies for surat_generated
CREATE POLICY "select_surat_own" ON public.surat_generated FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.pengajuan p
      WHERE p.id = surat_generated.pengajuan_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "select_surat_admin" ON public.surat_generated FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'lurah', 'operator')
    )
  );
CREATE POLICY "insert_surat_admin" ON public.surat_generated FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'lurah', 'operator')
    )
  );
CREATE POLICY "update_surat_admin" ON public.surat_generated FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'lurah', 'operator')
    )
  );

-- Add letterhead settings to admin_settings
INSERT INTO public.admin_settings (key, value, tipe, grup, label, deskripsi) VALUES
  ('nomor_surat_prefix', 'KTM', 'text', 'surat', 'Prefix Nomor Surat', 'Prefix untuk nomor surat otomatis'),
  ('nomor_surat_counter', '1', 'number', 'surat', 'Counter Nomor Surat', 'Counter untuk nomor surat tahunan'),
  ('letterhead_image', '', 'text', 'surat', 'URL Logo Kop Surat', 'URL gambar logo untuk kop surat'),
  ('ttd_lurah_image', '', 'text', 'surat', 'URL Tanda Tangan Lurah', 'URL gambar tanda tangan lurah'),
  ('nama_lurah_ttd', 'H. Ahmad Syahputra, S.Sos', 'text', 'surat', 'Nama Lurah untuk TTD', 'Nama lurah yang akan tanda tangan'),
  ('nip_lurah', '19700101 199503 1 001', 'text', 'surat', 'NIP Lurah', 'NIP lurah untuk tanda tangan surat')
ON CONFLICT (key) DO NOTHING;

-- Create function to generate surat number
CREATE OR REPLACE FUNCTION public.generate_nomor_surat()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_counter integer;
  v_year integer;
  v_prefix text;
  v_nomor text;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  SELECT value INTO v_prefix FROM public.admin_settings WHERE key = 'nomor_surat_prefix';
  IF v_prefix IS NULL THEN v_prefix := 'KTM'; END IF;
  
  -- Get and increment counter
  SELECT CAST(value AS integer) INTO v_counter FROM public.admin_settings WHERE key = 'nomor_surat_counter';
  IF v_counter IS NULL THEN v_counter := 1; END IF;
  
  v_nomor := v_prefix || '/' || LPAD(v_counter::text, 3, '0') || '/' || v_year::text;
  
  -- Increment counter
  UPDATE public.admin_settings SET value = (v_counter + 1)::text WHERE key = 'nomor_surat_counter';
  
  RETURN v_nomor;
END;
$$;