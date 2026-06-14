import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccountBalanceIcon sx={{ fontSize: 36, color: '#FFC107' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                  PEMERINTAH KOTA MEDAN
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Kelurahan Kotamatsum III
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Kecamatan Medan Kota
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 2, lineHeight: 1.7 }}>
              Portal pelayanan digital masyarakat Kelurahan Kotamatsum III.
              Kami berkomitmen memberikan pelayanan publik yang cepat, transparan, dan efisien.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#1877F2' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#E1306C' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#FF0000' } }}>
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#FFC107' }}>
              Navigasi
            </Typography>
            {[
              { label: 'Beranda', path: '/' },
              { label: 'Profil Kelurahan', path: '/profil' },
              { label: 'Layanan Online', path: '/layanan' },
              { label: 'Tracking Status', path: '/tracking' },
              { label: 'Informasi', path: '/informasi' },
              { label: 'Pengaduan', path: '/pengaduan' },
            ].map((item) => (
              <Link
                key={item.path}
                component="button"
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  mb: 0.75,
                  fontSize: '0.875rem',
                  '&:hover': { color: 'white' },
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </Link>
            ))}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#FFC107' }}>
              Kontak
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { icon: <LocationOnIcon fontSize="small" />, text: 'Jl. Kotamatsum III, Medan Kota, Kota Medan, Sumatera Utara' },
                { icon: <PhoneIcon fontSize="small" />, text: '(061) 4512345' },
                { icon: <EmailIcon fontSize="small" />, text: 'kelurahan.kotamatsum3@pemkomedan.go.id' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ color: '#FFC107', mt: 0.2, flexShrink: 0 }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#FFC107' }}>
              Jam Pelayanan
            </Typography>
            {[
              { hari: 'Senin – Kamis', jam: '08.00 – 16.00 WIB' },
              { hari: 'Jumat', jam: '08.00 – 11.30 WIB' },
              { hari: 'Sabtu – Minggu', jam: 'Tutup' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ color: '#FFC107', flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, lineHeight: 1.2 }}>
                    {item.hari}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {item.jam}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.15)' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © {year} Kelurahan Kotamatsum III – Kecamatan Medan Kota, Kota Medan
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Sistem Pelayanan Digital
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
