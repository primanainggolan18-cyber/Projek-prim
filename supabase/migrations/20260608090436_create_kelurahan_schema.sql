
-- Users/profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  email text,
  telepon text,
  role text NOT NULL DEFAULT 'warga' CHECK (role IN ('warga', 'operator', 'admin', 'lurah')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_profiles" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "delete_profiles" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Layanan pengajuan
CREATE TABLE IF NOT EXISTS layanan_pengajuan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_registrasi text UNIQUE NOT NULL,
  nik text NOT NULL,
  nama_lengkap text NOT NULL,
  alamat text NOT NULL,
  nomor_hp text NOT NULL,
  jenis_layanan text NOT NULL,
  keterangan text,
  dokumen_url text,
  status text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'diproses', 'selesai', 'ditolak')),
  catatan_admin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE layanan_pengajuan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_layanan" ON layanan_pengajuan FOR SELECT USING (true);
CREATE POLICY "insert_layanan" ON layanan_pengajuan FOR INSERT WITH CHECK (true);
CREATE POLICY "update_layanan" ON layanan_pengajuan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_layanan" ON layanan_pengajuan FOR DELETE TO authenticated USING (true);

-- Pengaduan
CREATE TABLE IF NOT EXISTS pengaduan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_aduan text UNIQUE NOT NULL,
  nama text NOT NULL,
  nomor_hp text NOT NULL,
  kategori text NOT NULL,
  deskripsi text NOT NULL,
  foto_url text,
  status text NOT NULL DEFAULT 'diterima' CHECK (status IN ('diterima', 'diproses', 'selesai')),
  catatan_admin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pengaduan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_pengaduan" ON pengaduan FOR SELECT USING (true);
CREATE POLICY "insert_pengaduan" ON pengaduan FOR INSERT WITH CHECK (true);
CREATE POLICY "update_pengaduan" ON pengaduan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_pengaduan" ON pengaduan FOR DELETE TO authenticated USING (true);

-- Berita / Pengumuman
CREATE TABLE IF NOT EXISTS berita (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  konten text NOT NULL,
  kategori text NOT NULL DEFAULT 'berita' CHECK (kategori IN ('berita', 'pengumuman', 'agenda', 'program')),
  gambar_url text,
  tanggal_event date,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE berita ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_berita" ON berita FOR SELECT USING (true);
CREATE POLICY "insert_berita" ON berita FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_berita" ON berita FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_berita" ON berita FOR DELETE TO authenticated USING (true);

-- Galeri
CREATE TABLE IF NOT EXISTS galeri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL,
  deskripsi text,
  url text NOT NULL,
  tipe text NOT NULL DEFAULT 'foto' CHECK (tipe IN ('foto', 'video')),
  kategori text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_galeri" ON galeri FOR SELECT USING (true);
CREATE POLICY "insert_galeri" ON galeri FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_galeri" ON galeri FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_galeri" ON galeri FOR DELETE TO authenticated USING (true);

-- Kontak masyarakat
CREATE TABLE IF NOT EXISTS kontak_pesan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  email text NOT NULL,
  subjek text NOT NULL,
  pesan text NOT NULL,
  dibaca boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kontak_pesan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_kontak" ON kontak_pesan FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_kontak" ON kontak_pesan FOR INSERT WITH CHECK (true);
CREATE POLICY "update_kontak" ON kontak_pesan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_kontak" ON kontak_pesan FOR DELETE TO authenticated USING (true);

-- Seed berita
INSERT INTO berita (judul, konten, kategori, gambar_url, published) VALUES
('Sosialisasi Program Bantuan Sosial 2025', 'Kelurahan Kotamatsum III mengadakan sosialisasi program bantuan sosial untuk warga yang membutuhkan. Kegiatan ini dilaksanakan di aula kantor kelurahan dan dihadiri oleh ratusan warga.', 'berita', null, true),
('Pengumuman Jadwal Pelayanan Hari Raya', 'Sehubungan dengan pelaksanaan hari raya, pelayanan administrasi akan dilaksanakan sesuai jadwal khusus. Masyarakat diharap memperhatikan jadwal pelayanan yang telah ditetapkan.', 'pengumuman', null, true),
('Gotong Royong Bersih Lingkungan', 'Warga Kelurahan Kotamatsum III bersama perangkat kelurahan melaksanakan kegiatan gotong royong membersihkan lingkungan sekitar. Kegiatan ini rutin dilaksanakan setiap bulan.', 'berita', null, true),
('Program Posyandu Bulanan', 'Kegiatan Posyandu Balita dan Lansia akan dilaksanakan pada minggu pertama setiap bulan di seluruh RW Kelurahan Kotamatsum III.', 'agenda', null, true),
('Digitalisasi Layanan Administrasi Kelurahan', 'Dalam rangka meningkatkan kualitas pelayanan publik, Kelurahan Kotamatsum III meluncurkan sistem pelayanan administrasi digital yang dapat diakses oleh seluruh warga.', 'program', null, true);

-- Seed galeri (using placeholder)
INSERT INTO galeri (judul, deskripsi, url, tipe, kategori) VALUES
('Kantor Kelurahan Kotamatsum III', 'Gedung kantor kelurahan yang modern dan representatif', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'foto', 'infrastruktur'),
('Rapat Koordinasi RT/RW', 'Rapat koordinasi rutin bersama seluruh RT dan RW', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'foto', 'kegiatan'),
('Kegiatan Posyandu', 'Pelaksanaan posyandu balita bersama kader kesehatan', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800', 'foto', 'kesehatan'),
('Gotong Royong', 'Kegiatan bersih lingkungan bersama warga', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', 'foto', 'kegiatan');
