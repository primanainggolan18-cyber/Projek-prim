-- Create layanan master table (admin-managed service types)
CREATE TABLE IF NOT EXISTS public.layanan_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_layanan text NOT NULL UNIQUE,
  deskripsi text,
  icon text DEFAULT '📄',
  syarat text[] DEFAULT '{}',
  template_surat text,
  fields jsonb DEFAULT '[]',
  aktif boolean DEFAULT true,
  urutan integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pengajuan table (submissions from citizens)
CREATE TABLE IF NOT EXISTS public.pengajuan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_registrasi text NOT NULL UNIQUE,
  layanan_id uuid NOT NULL REFERENCES public.layanan_master(id),
  user_id uuid REFERENCES auth.users(id),
  nama_lengkap text NOT NULL,
  nik text NOT NULL,
  alamat text NOT NULL,
  nomor_hp text NOT NULL,
  email text,
  data_json jsonb DEFAULT '{}',
  keterangan text,
  status text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'menunggu_verifikasi', 'selesai', 'ditolak')),
  catatan_admin text,
  tanggal_diajukan timestamptz DEFAULT now(),
  tanggal_selesai timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create berkas table (uploaded files for pengajuan)
CREATE TABLE IF NOT EXISTS public.berkas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengajuan_id uuid NOT NULL REFERENCES public.pengajuan(id) ON DELETE CASCADE,
  nama_file text NOT NULL,
  tipe_berkas text NOT NULL,
  ukuran integer,
  storage_path text NOT NULL,
  public_url text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create admin_settings table (web configuration)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  tipe text DEFAULT 'text' CHECK (tipe IN ('text', 'json', 'boolean', 'number')),
  grup text DEFAULT 'umum',
  label text,
  deskripsi text,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO public.admin_settings (key, value, tipe, grup, label, deskripsi) VALUES
  ('nama_instansi', 'Kelurahan Kotamatsum III', 'text', 'umum', 'Nama Instansi', 'Nama lengkap instansi'),
  ('alamat_instansi', 'Jl. Kotamatsum III, Medan Kota, Kota Medan 20157', 'text', 'umum', 'Alamat', 'Alamat lengkap instansi'),
  ('telepon', '(061) 4512345', 'text', 'umum', 'Telepon', 'Nomor telepon instansi'),
  ('email_instansi', 'info@kotamatsum3.go.id', 'text', 'umum', 'Email', 'Email resmi instansi'),
  ('jam_operasional', '{"senin_kamis":"08.00 – 16.00","jumat":"08.00 – 11.30","sabtu":"Tutup","minggu":"Tutup"}', 'json', 'umum', 'Jam Operasional', 'Jam pelayanan kantor'),
  ('sambutan_lurah', 'Assalamualaikum Warahmatullahi Wabarakatuh. Dengan penuh rasa syukur kepada Allah SWT, kami menghadirkan portal pelayanan digital Kelurahan Kotamatsum III sebagai wujud komitmen kami dalam meningkatkan kualitas pelayanan publik.', 'text', 'umum', 'Sambutan Lurah', 'Teks sambutan di beranda'),
  ('nama_lurah', 'H. Ahmad Syahputra, S.Sos', 'text', 'umum', 'Nama Lurah', 'Nama Kepala Kelurahan'),
  ('logo_url', '', 'text', 'tampilan', 'URL Logo', 'URL logo instansi'),
  ('hero_title', 'Selamat Datang di Kelurahan Kotamatsum III', 'text', 'tampilan', 'Judul Hero', 'Judul utama halaman beranda'),
  ('hero_subtitle', 'Kecamatan Medan Kota, Kota Medan', 'text', 'tampilan', 'Sub Judul Hero', 'Sub judul halaman beranda'),
  ('hero_description', 'Kami hadir untuk memberikan pelayanan administrasi publik yang cepat, transparan, dan efisien melalui platform digital terpadu.', 'text', 'tampilan', 'Deskripsi Hero', 'Deskripsi halaman beranda'),
  ('warna_primary', '#0D47A1', 'text', 'tampilan', 'Warna Primary', 'Warna utama tema'),
  ('layanan_aktif', 'true', 'boolean', 'fitur', 'Aktifkan Layanan Online', 'Toggle layanan online'),
  ('pengaduan_aktif', 'true', 'boolean', 'fitur', 'Aktifkan Pengaduan', 'Toggle pengaduan online'),
  ('tracking_aktif', 'true', 'boolean', 'fitur', 'Aktifkan Tracking', 'Toggle tracking status'),
  ('footer_text', 'Hak Cipta 2024 - Kelurahan Kotamatsum III. Semua hak dilindungi.', 'text', 'tampilan', 'Teks Footer', 'Teks hak cipta footer')
ON CONFLICT (key) DO NOTHING;

-- Insert default layanan master
INSERT INTO public.layanan_master (nama_layanan, deskripsi, icon, syarat, template_surat, fields, urutan) VALUES
  ('Surat Keterangan Domisili', 'Surat keterangan tempat tinggal/domisili warga', '🏠', ARRAY['KTP asli', 'KK asli', 'Surat pengantar RT/RW'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], Kecamatan [KECAMATAN], Kota [KOTA], dengan ini menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]
Alamat : [alamat]

Adalah benar warga yang berdomisili di Kelurahan [NAMA_INSTANSI] sesuai alamat tersebut di atas.

Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.', '[{"name":"nama_lengkap","label":"Nama Lengkap","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true},{"name":"alamat","label":"Alamat Lengkap","type":"textarea","required":true}]'::jsonb, 1),
  ('Surat Pengantar KTP', 'Surat pengantar pembuatan/Perpanjangan KTP', '🪪', ARRAY['KK asli', 'Surat pengantar RT/RW', 'Akta lahir'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]

Adalah benar warga Kelurahan [NAMA_INSTANSI] dan mengajukan permohonan pembuatan KTP.

Demikian surat pengantar ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Lengkap","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true}]'::jsonb, 2),
  ('Surat Pengantar KK', 'Surat pengantar pembuatan/perubahan KK', '👨‍👩‍👧‍👦', ARRAY['KK lama', 'KTP semua anggota', 'Surat pengantar RT/RW'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama Kepala Keluarga : [nama_lengkap]
Alamat : [alamat]

Adalah benar warga Kelurahan [NAMA_INSTANSI] dan mengajukan permohonan pembuatan KK baru.

Demikian surat pengantar ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Kepala Keluarga","type":"text","required":true},{"name":"alamat","label":"Alamat Lengkap","type":"textarea","required":true}]'::jsonb, 3),
  ('Surat Keterangan Tidak Mampu', 'Surat keterangan tidak mampu/ekonomi lemah', '📋', ARRAY['KTP asli', 'KK asli', 'Surat pengantar RT/RW', 'Foto rumah'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]
Alamat : [alamat]

Adalah benar warga Kelurahan [NAMA_INSTANSI] yang tergolong tidak mampu/ekonomi lemah.

Demikian surat keterangan ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Lengkap","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true},{"name":"alamat","label":"Alamat Lengkap","type":"textarea","required":true}]'::jsonb, 4),
  ('Surat Keterangan Usaha', 'Surat keterangan memiliki usaha', '🏪', ARRAY['KTP asli', 'KK asli', 'Foto tempat usaha'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]
Alamat Usaha : [alamat]

Adalah benar memiliki usaha di wilayah Kelurahan [NAMA_INSTANSI].

Demikian surat keterangan ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Lengkap","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true},{"name":"alamat","label":"Alamat Usaha","type":"textarea","required":true}]'::jsonb, 5),
  ('Surat Keterangan Belum Menikah', 'Surat keterangan status belum menikah', '💍', ARRAY['KTP asli', 'KK asli', 'Akta lahir'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]

Adalah benar warga Kelurahan [NAMA_INSTANSI] yang sampai saat ini berstatus BELUM MENIKAH.

Demikian surat keterangan ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Lengkap","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true}]'::jsonb, 6),
  ('Surat Keterangan Kematian', 'Surat keterangan kematian warga', '📄', ARRAY['KTP almarhum', 'KK asli', 'Surat keterangan dokter/RS'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama Alm : [nama_lengkap]
NIK : [nik]
Alamat : [alamat]

Telah meninggal dunia pada tanggal ...

Demikian surat keterangan ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Alm/Almh","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true},{"name":"alamat","label":"Alamat","type":"textarea","required":true}]'::jsonb, 7),
  ('Surat Pengantar Nikah', 'Surat pengantar nikah (N1-N7)', '💒', ARRAY['KTP calon pengantin', 'KK asli', 'Akta lahir', 'Pas foto 4x6 (4 lembar)'], 'Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]
Alamat : [alamat]

Adalah benar warga Kelurahan [NAMA_INSTANSI] yang akan melangsungkan pernikahan.

Demikian surat pengantar ini dibuat.', '[{"name":"nama_lengkap","label":"Nama Calon Pengantin","type":"text","required":true},{"name":"nik","label":"NIK","type":"text","required":true},{"name":"alamat","label":"Alamat","type":"textarea","required":true}]'::jsonb, 8)
ON CONFLICT (nama_layanan) DO NOTHING;

-- Enable RLS
ALTER TABLE public.layanan_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berkas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Layanan master policies (public read, admin write)
CREATE POLICY "select_layanan_master" ON public.layanan_master FOR SELECT
  TO authenticated, anon USING (aktif = true);
CREATE POLICY "admin_insert_layanan" ON public.layanan_master FOR INSERT
  TO authenticated WITH CHECK (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "admin_update_layanan" ON public.layanan_master FOR UPDATE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator')) WITH CHECK (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "admin_delete_layanan" ON public.layanan_master FOR DELETE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator'));

-- Pengajuan policies
CREATE POLICY "select_own_pengajuan" ON public.pengajuan FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "select_all_pengajuan_admin" ON public.pengajuan FOR SELECT
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "insert_pengajuan" ON public.pengajuan FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_pengajuan_admin" ON public.pengajuan FOR UPDATE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator')) WITH CHECK (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "delete_pengajuan_admin" ON public.pengajuan FOR DELETE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator'));

-- Berkas policies
CREATE POLICY "select_berkas_own" ON public.berkas FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.pengajuan p
      WHERE p.id = berkas.pengajuan_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "select_berkas_admin" ON public.berkas FOR SELECT
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "insert_berkas" ON public.berkas FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "delete_berkas_admin" ON public.berkas FOR DELETE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator'));

-- Admin settings policies (public read, admin write)
CREATE POLICY "select_settings" ON public.admin_settings FOR SELECT
  TO authenticated, anon USING (true);
CREATE POLICY "admin_update_settings" ON public.admin_settings FOR UPDATE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator')) WITH CHECK (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "admin_insert_settings" ON public.admin_settings FOR INSERT
  TO authenticated WITH CHECK (public.get_my_role() IN ('admin', 'lurah', 'operator'));
CREATE POLICY "admin_delete_settings" ON public.admin_settings FOR DELETE
  TO authenticated USING (public.get_my_role() IN ('admin', 'lurah', 'operator'));
