import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LayananStatus = 'menunggu' | 'diproses' | 'selesai' | 'ditolak';
export type PengaduanStatus = 'diterima' | 'diproses' | 'selesai';
export type BeritaKategori = 'berita' | 'pengumuman' | 'agenda' | 'program';
export type UserRole = 'warga' | 'operator' | 'admin' | 'lurah';

export interface Pengaduan {
  id: string;
  nomor_aduan: string;
  nama: string;
  nomor_hp: string;
  kategori: string;
  deskripsi: string;
  foto_url?: string;
  status: PengaduanStatus;
  catatan_admin?: string;
  created_at: string;
  updated_at: string;
}

export interface Berita {
  id: string;
  judul: string;
  konten: string;
  kategori: BeritaKategori;
  gambar_url?: string;
  tanggal_event?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Galeri {
  id: string;
  judul: string;
  deskripsi?: string;
  url: string;
  tipe: 'foto' | 'video';
  kategori?: string;
  created_at: string;
}

export interface KontakPesan {
  id: string;
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  dibaca: boolean;
  created_at: string;
}

export interface LayananMaster {
  id: string;
  nama_layanan: string;
  deskripsi: string;
  icon: string;
  syarat: string[];
  template_surat: string;
  fields: FieldConfig[];
  aktif: boolean;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

export interface Pengajuan {
  id: string;
  nomor_registrasi: string;
  layanan_id: string;
  user_id: string | null;
  nama_lengkap: string;
  nik: string;
  alamat: string;
  nomor_hp: string;
  email: string | null;
  data_json: Record<string, any>;
  keterangan: string | null;
  status: 'menunggu' | 'diproses' | 'menunggu_verifikasi' | 'selesai' | 'ditolak';
  catatan_admin: string | null;
  tanggal_diajukan: string;
  tanggal_selesai: string | null;
  created_at: string;
  updated_at: string;
  layanan?: LayananMaster;
}

export interface Berkas {
  id: string;
  pengajuan_id: string;
  nama_file: string;
  tipe_berkas: string;
  ukuran: number | null;
  storage_path: string;
  public_url: string | null;
  uploaded_at: string;
}

export interface SuratGenerated {
  id: string;
  pengajuan_id: string;
  template_used: string | null;
  konten_surat: string;
  nomor_surat: string | null;
  tanggal_surat: string;
  generated_at: string;
  generated_by: string | null;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: string | null;
  tipe: 'text' | 'json' | 'boolean' | 'number';
  grup: string;
  label: string | null;
  deskripsi: string | null;
  updated_at: string;
}

export function generateNomorRegistrasi(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `KTM-${year}${month}${day}-${rand}`;
}

export function generateNomorAduan(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ADU-${year}${month}-${rand}`;
}
