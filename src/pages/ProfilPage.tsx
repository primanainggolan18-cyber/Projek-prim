import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const struktur = [
  { jabatan: 'Lurah', nama: 'H. Ahmad Syahputra, S.Sos', foto: null },
  { jabatan: 'Sekretaris Lurah', nama: 'Drs. Budi Santoso', foto: null },
  { jabatan: 'Kasi Pemerintahan', nama: 'Siti Rahayu, S.IP', foto: null },
  { jabatan: 'Kasi Pembangunan', nama: 'M. Rizky Putra, ST', foto: null },
  { jabatan: 'Kasi Kemasyarakatan', nama: 'Dewi Kusuma, SE', foto: null },
  { jabatan: 'Staf Administrasi', nama: 'Andi Prasetyo', foto: null },
];

const dataWilayah = [
  { label: 'Luas Wilayah', value: '1,2 km²' },
  { label: 'Jumlah RT', value: '32 RT' },
  { label: 'Jumlah RW', value: '8 RW' },
  { label: 'Jumlah Penduduk', value: '12.450 jiwa' },
  { label: 'Jumlah KK', value: '3.210 KK' },
  { label: 'Kepadatan', value: '10.375 jiwa/km²' },
];

export default function ProfilPage() {
  const navigate = useNavigate();
  return (
    <Box>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0D47A1, #1565C0)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Kembali
          </Button>
          <Chip label="Profil Kelurahan" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Profil Kelurahan Kotamatsum III
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Kecamatan Medan Kota, Kota Medan, Sumatera Utara
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Sejarah */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip label="Sejarah" color="primary" size="small" sx={{ mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Sejarah Kelurahan
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, mb: 2 }}>
              Kelurahan Kotamatsum III merupakan salah satu kelurahan yang berada di wilayah Kecamatan Medan Kota, Kota Medan, Provinsi Sumatera Utara. Kelurahan ini memiliki sejarah panjang sebagai bagian dari perkembangan Kota Medan yang terus berkembang pesat.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              Seiring berjalannya waktu, Kelurahan Kotamatsum III terus berbenah dalam memberikan pelayanan terbaik kepada masyarakat dengan memanfaatkan teknologi informasi untuk meningkatkan kualitas dan efisiensi pelayanan publik.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600"
              alt="Kelurahan Kotamatsum III"
              sx={{ width: '100%', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            />
          </Grid>
        </Grid>

        {/* Visi Misi */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <EmojiEventsIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Visi</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.8, color: 'text.secondary', fontSize: '1.05rem' }}>
                  "Terwujudnya Kelurahan Kotamatsum III yang Maju, Sejahtera, dan Berdaya Saing Melalui Pelayanan Publik yang Prima dan Transparan"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Misi</Typography>
                </Box>
                {[
                  'Meningkatkan kualitas pelayanan administrasi yang cepat dan transparan',
                  'Memberdayakan masyarakat melalui program pembangunan berkelanjutan',
                  'Mewujudkan tata kelola pemerintahan yang bersih dan akuntabel',
                  'Meningkatkan partisipasi masyarakat dalam pembangunan kelurahan',
                  'Mengoptimalkan pemanfaatan teknologi informasi dalam pelayanan publik',
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'secondary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700 }}>
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Wilayah */}
        <Box sx={{ mb: 6 }}>
          <Chip label="Data Wilayah" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Data Wilayah & Kependudukan
          </Typography>
          <Grid container spacing={2}>
            {dataWilayah.map((item, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{item.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block', mt: 0.5 }}>{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[
              { icon: <HomeIcon />, label: 'Batas Utara', value: 'Kelurahan Kotamatsum II' },
              { icon: <HomeIcon />, label: 'Batas Selatan', value: 'Kelurahan Kotamatsum IV' },
              { icon: <HomeIcon />, label: 'Batas Timur', value: 'Kecamatan Medan Timur' },
              { icon: <LocationOnIcon />, label: 'Batas Barat', value: 'Kelurahan Kotamatsum I' },
            ].map((item, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Struktur Organisasi */}
        <Box sx={{ mb: 6 }}>
          <Chip label="Struktur Organisasi" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Struktur Organisasi Kelurahan
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {/* Lurah */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ textAlign: 'center', border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent sx={{ py: 3 }}>
                  <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{struktur[0].nama}</Typography>
                  <Chip label={struktur[0].jabatan} color="primary" size="small" sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {struktur.slice(1).map((item, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.nama}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.jabatan}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Peta */}
        <Box>
          <Chip label="Lokasi" color="primary" size="small" sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Peta Lokasi
          </Typography>
          <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'grey.100', flexDirection: 'column', gap: 2 }}>
              <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" color="text.secondary">Kelurahan Kotamatsum III</Typography>
              <Typography variant="body2" color="text.secondary">Jl. Kotamatsum III, Medan Kota, Kota Medan 20157</Typography>
              <Box
                component="a"
                href="https://maps.google.com/?q=Kotamatsum+III+Medan"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  px: 3, py: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: 2,
                  textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
                  '&:hover': { bgcolor: 'primary.dark' },
                  display: 'inline-block',
                }}
              >
                Buka di Google Maps
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
