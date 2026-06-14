import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../lib/supabase';

interface ContactForm {
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
}

const kontakInfo = [
  {
    icon: <LocationOnIcon />,
    label: 'Alamat',
    value: 'Jl. Kotamatsum III, Medan Kota, Kota Medan 20157, Sumatera Utara',
    color: '#1565C0',
  },
  {
    icon: <PhoneIcon />,
    label: 'Telepon',
    value: '(061) 4512345',
    color: '#2E7D32',
  },
  {
    icon: <EmailIcon />,
    label: 'Email',
    value: 'kelurahan.kotamatsum3@pemkomedan.go.id',
    color: '#ED6C02',
  },
  {
    icon: <AccessTimeIcon />,
    label: 'Jam Pelayanan',
    value: 'Senin–Kamis: 08.00–16.00 | Jumat: 08.00–11.30',
    color: '#9C27B0',
  },
];

export default function KontakPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, reset } = useForm<ContactForm>({
    defaultValues: { nama: '', email: '', subjek: '', pesan: '' },
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.from('kontak_pesan').insert(data);
      if (err) throw err;
      setSuccess(true);
      reset();
    } catch {
      setError('Gagal mengirim pesan. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
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
          <Chip label="Kontak" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Hubungi Kami
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Kami siap melayani pertanyaan dan masukan Anda
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Chip label="Informasi Kontak" color="primary" size="small" sx={{ mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Informasi Kantor
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {kontakInfo.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: `${item.color}18`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Map placeholder */}
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: 220,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <LocationOnIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">Kelurahan Kotamatsum III</Typography>
              <Box
                component="a"
                href="https://maps.google.com/?q=Kotamatsum+III+Medan"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  px: 2, py: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1.5,
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Buka Google Maps
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Kirim Pesan
                </Typography>

                {success ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Pesan Terkirim!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.
                    </Typography>
                    <Button variant="contained" onClick={() => setSuccess(false)}>
                      Kirim Pesan Lagi
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="nama"
                          control={control}
                          rules={{ required: 'Nama wajib diisi' }}
                          render={({ field, fieldState }) => (
                            <TextField {...field} label="Nama Lengkap" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="email"
                          control={control}
                          rules={{ required: 'Email wajib diisi', pattern: { value: /\S+@\S+\.\S+/, message: 'Format email tidak valid' } }}
                          render={({ field, fieldState }) => (
                            <TextField {...field} label="Email" type="email" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="subjek"
                          control={control}
                          rules={{ required: 'Subjek wajib diisi' }}
                          render={({ field, fieldState }) => (
                            <TextField {...field} label="Subjek" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="pesan"
                          control={control}
                          rules={{ required: 'Pesan wajib diisi' }}
                          render={({ field, fieldState }) => (
                            <TextField {...field} label="Pesan" fullWidth multiline rows={5} error={!!fieldState.error} helperText={fieldState.error?.message} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        >
                          {loading ? 'Mengirim...' : 'Kirim Pesan'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
