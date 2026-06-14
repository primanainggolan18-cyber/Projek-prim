import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { supabase } from '../lib/supabase';
import type { Berita } from '../lib/supabase';
import NewsCard from '../components/NewsCard';
import StatCard from '../components/StatCard';

const layananList = [
  'Surat Keterangan Domisili',
  'Surat Pengantar KTP',
  'Surat Pengantar KK',
  'Surat Keterangan Tidak Mampu',
  'Surat Keterangan Usaha',
  'Surat Keterangan Belum Menikah',
  'Surat Keterangan Kematian',
  'Surat Pengantar Nikah',
];

const jamPelayanan = [
  { hari: 'Senin – Kamis', jam: '08.00 – 16.00 WIB' },
  { hari: 'Jumat', jam: '08.00 – 11.30 WIB' },
  { hari: 'Sabtu', jam: 'Tutup' },
  { hari: 'Minggu', jam: 'Tutup' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [berita, setBerita] = useState<Berita[]>([]);
  const [stats, setStats] = useState({ total: 0, selesai: 0, pengaduan: 0, pengguna: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const fetchData = async () => {
      const [beritaRes, layananRes, pengaduanRes] = await Promise.all([
        supabase.from('berita').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('layanan_pengajuan').select('id, status'),
        supabase.from('pengaduan').select('id'),
      ]);
      if (beritaRes.data) setBerita(beritaRes.data);
      if (layananRes.data) {
        const total = layananRes.data.length;
        const selesai = layananRes.data.filter(l => l.status === 'selesai').length;
        setStats(prev => ({ ...prev, total, selesai }));
      }
      if (pengaduanRes.data) {
        setStats(prev => ({ ...prev, pengaduan: pengaduanRes.data!.length }));
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #1976D2 70%, #0288D1 100%)',
          color: 'white',
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', top: '20%', right: '15%', width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Fade in={visible} timeout={800}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Chip label="Portal Pelayanan Digital" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2, fontWeight: 600, border: '1px solid rgba(255,193,7,0.3)' }} />
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '2.75rem' }, lineHeight: 1.2 }}>
                  Selamat Datang di{' '}
                  <Box component="span" sx={{ color: '#FFC107' }}>
                    Kelurahan Kotamatsum III
                  </Box>
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 400, lineHeight: 1.6 }}>
                  Kecamatan Medan Kota, Kota Medan
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 4, lineHeight: 1.8, maxWidth: 520 }}>
                  Kami hadir untuk memberikan pelayanan administrasi publik yang cepat, transparan, dan efisien melalui platform digital terpadu.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/layanan')}
                    sx={{
                      bgcolor: '#FFC107',
                      color: '#0D47A1',
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#FFB300' },
                      boxShadow: '0 4px 20px rgba(255,193,7,0.4)',
                    }}
                  >
                    Ajukan Layanan
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<TrackChangesIcon />}
                    onClick={() => navigate('/tracking')}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    Cek Status
                  </Button>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {[
                    { icon: <AssignmentIcon sx={{ fontSize: 28 }} />, value: stats.total || '150+', label: 'Total Pengajuan' },
                    { icon: <CheckCircleIcon sx={{ fontSize: 28 }} />, value: stats.selesai || '120+', label: 'Selesai Diproses' },
                    { icon: <PeopleIcon sx={{ fontSize: 28 }} />, value: '12.450', label: 'Jumlah Penduduk' },
                    { icon: <SpeedIcon sx={{ fontSize: 28 }} />, value: '< 3 Hari', label: 'Rata-rata Selesai' },
                  ].map((item, i) => (
                    <Paper
                      key={i}
                      sx={{
                        p: 2.5,
                        bgcolor: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        color: 'white',
                        textAlign: 'center',
                      }}
                    >
                      <Box sx={{ color: '#FFC107', mb: 1 }}>{item.icon}</Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{item.value}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>{item.label}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Quick Services */}
      <Box sx={{ bgcolor: 'background.default', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip label="Layanan Online" color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Layanan Administrasi Digital
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ajukan berbagai keperluan surat menyurat secara online tanpa perlu antri
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {layananList.map((layanan, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{ cursor: 'pointer', height: '100%' }}
                  onClick={() => navigate(`/layanan?jenis=${encodeURIComponent(layanan)}`)}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, flexShrink: 0 }}>
                      <DescriptionIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {layanan}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/layanan')}
            >
              Lihat Semua Layanan
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Sambutan Lurah */}
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600"
                alt="Kantor Kelurahan"
                sx={{ width: '100%', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip label="Sambutan Lurah" color="primary" size="small" sx={{ mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Sambutan Kepala Kelurahan
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3 }}>
                Assalamu'alaikum Warahmatullahi Wabarakatuh. Dengan penuh rasa syukur kepada Allah SWT, kami menghadirkan portal pelayanan digital Kelurahan Kotamatsum III sebagai wujud komitmen kami dalam meningkatkan kualitas pelayanan publik. Melalui platform ini, kami berharap masyarakat dapat mengakses berbagai layanan administrasi dengan lebih mudah, cepat, dan transparan.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3 }}>
                Kami mengajak seluruh warga untuk aktif berpartisipasi dalam pembangunan kelurahan dan memanfaatkan fasilitas digital ini sebaik-baiknya. Aspirasi dan pengaduan masyarakat adalah prioritas kami dalam mewujudkan kelurahan yang maju dan sejahtera.
              </Typography>
              <Box sx={{ p: 2.5, bgcolor: 'primary.main', borderRadius: 3, display: 'inline-block' }}>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>
                  H. Ahmad Syahputra, S.Sos
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  Lurah Kotamatsum III
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics */}
      <Box sx={{ py: 6, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip label="Statistik" color="secondary" size="small" sx={{ mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Data Pelayanan Terkini
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<AssignmentIcon sx={{ fontSize: 28 }} />} title="Total Pengajuan Surat" value={stats.total || 0} subtitle="Sepanjang tahun ini" color="#1565C0" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<CheckCircleIcon sx={{ fontSize: 28 }} />} title="Layanan Selesai" value={stats.selesai || 0} subtitle="Berhasil diproses" color="#2E7D32" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<ReportProblemIcon sx={{ fontSize: 28 }} />} title="Total Pengaduan" value={stats.pengaduan || 0} subtitle="Diterima & diproses" color="#ED6C02" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard icon={<PeopleIcon sx={{ fontSize: 28 }} />} title="Jumlah Penduduk" value="12.450" subtitle="Per Desember 2024" color="#9C27B0" />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Berita Terbaru */}
      {berita.length > 0 && (
        <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Chip label="Informasi" color="primary" size="small" sx={{ mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Berita & Pengumuman
                </Typography>
              </Box>
              <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/informasi')}>
                Lihat Semua
              </Button>
            </Box>
            <Grid container spacing={3}>
              {berita.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <NewsCard item={item} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Jam Pelayanan */}
      <Box
        sx={{
          py: 6,
          background: 'linear-gradient(135deg, #0D47A1, #1565C0)',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip label="Jam Operasional" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Jam Pelayanan Kantor
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                Layanan tatap muka tersedia pada jam operasional berikut. Untuk layanan online, tersedia 24 jam melalui portal ini.
              </Typography>
              <Grid container spacing={2}>
                {jamPelayanan.map((item, i) => (
                  <Grid key={i} size={{ xs: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.15)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <AccessTimeIcon fontSize="small" sx={{ color: '#FFC107' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.hari}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{item.jam}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: <LocationOnIcon />, label: 'Alamat', value: 'Jl. Kotamatsum III, Medan Kota, Kota Medan 20157' },
                  { icon: <PhoneIcon />, label: 'Telepon', value: '(061) 4512345' },
                  { icon: <AnnouncementIcon />, label: 'Layanan Online', value: '24 jam / 7 hari seminggu' },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Box sx={{ color: '#FFC107', flexShrink: 0, mt: 0.2 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/pengaduan')}
                  startIcon={<ReportProblemIcon />}
                  sx={{ bgcolor: '#FFC107', color: '#0D47A1', fontWeight: 700, '&:hover': { bgcolor: '#FFB300' }, mt: 1 }}
                >
                  Sampaikan Pengaduan
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
