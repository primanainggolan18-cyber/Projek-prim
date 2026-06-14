import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { supabase } from '../lib/supabase';
import type { Pengajuan } from '../lib/supabase';

const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' }> = {
  menunggu: { label: 'Menunggu Verifikasi', color: 'warning' },
  diproses: { label: 'Sedang Diproses', color: 'info' },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'primary' },
  selesai: { label: 'Selesai', color: 'success' },
  ditolak: { label: 'Ditolak', color: 'error' },
};

const timelineSteps = [
  { status: 'menunggu', label: 'Pengajuan Diterima', desc: 'Permohonan Anda telah diterima oleh sistem' },
  { status: 'diproses', label: 'Verifikasi Berkas', desc: 'Petugas sedang memverifikasi kelengkapan berkas' },
  { status: 'selesai', label: 'Surat Selesai', desc: 'Surat telah selesai diproses dan siap diambil' },
];

function getStepIndex(status: string) {
  const order = ['menunggu', 'diproses', 'selesai'];
  return order.indexOf(status);
}

export default function TrackingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Pengajuan | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { control, handleSubmit } = useForm<{ nomor: string }>({ defaultValues: { nomor: '' } });

  const onSearch = async (data: { nomor: string }) => {
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const { data: found, error } = await supabase
        .from('pengajuan')
        .select('*, layanan:layanan_master(nama_layanan, icon)')
        .eq('nomor_registrasi', data.nomor.trim().toUpperCase())
        .maybeSingle();
      if (error) throw error;
      if (found) {
        setResult(found as Pengajuan);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = result ? getStepIndex(result.status) : -1;
  const isDitolak = result?.status === 'ditolak';
  const layananNama = result ? (result.layanan as any)?.nama_layanan || 'Layanan' : '';
  const cfg = result ? statusConfig[result.status] || statusConfig.menunggu : statusConfig.menunggu;

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
          <Chip label="Tracking Status" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Pantau Status Layanan
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Masukkan nomor registrasi untuk melihat status pengajuan Anda
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Cari Status Pengajuan
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSearch)}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Controller
                    name="nomor"
                    control={control}
                    rules={{ required: 'Nomor registrasi wajib diisi' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Nomor Registrasi"
                        placeholder="Contoh: KTM-20241201-1234"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || 'Format: KTM-YYYYMMDD-XXXX'}
                        inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: 1 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    sx={{ height: 56 }}
                  >
                    {loading ? 'Mencari...' : 'Cari'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {notFound && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Nomor registrasi tidak ditemukan. Pastikan nomor yang Anda masukkan sudah benar.
          </Alert>
        )}

        {result && (
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <AssignmentIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{layananNama}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {result.nomor_registrasi}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={cfg.label}
                  color={cfg.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Nama Pemohon', value: result.nama_lengkap },
                  { label: 'NIK', value: result.nik },
                  { label: 'Nomor HP', value: result.nomor_hp },
                  { label: 'Tanggal Pengajuan', value: new Date(result.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                ].map((item, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                  </Grid>
                ))}
              </Grid>

              {result.catatan_admin && (
                <Alert severity={isDitolak ? 'error' : 'info'} sx={{ mb: 3 }}>
                  <Typography variant="body2"><strong>Catatan Petugas:</strong> {result.catatan_admin}</Typography>
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Progress Layanan
              </Typography>

              <Box>
                {isDitolak ? (
                  <Alert severity="error" icon={<CancelIcon />}>
                    Pengajuan ini telah ditolak. Silakan kunjungi kantor kelurahan untuk informasi lebih lanjut.
                  </Alert>
                ) : (
                  timelineSteps.map((step, i) => {
                    const done = i <= currentStepIdx;
                    const active = i === currentStepIdx;
                    const isLast = i === timelineSteps.length - 1;
                    return (
                      <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                          <Box
                            sx={{
                              width: 36, height: 36,
                              borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: done ? 'success.main' : 'grey.200',
                              color: done ? 'white' : 'text.disabled',
                              border: active ? '3px solid' : '2px solid',
                              borderColor: active ? 'success.light' : (done ? 'success.main' : 'grey.300'),
                              transition: 'all 0.3s',
                              zIndex: 1,
                            }}
                          >
                            {done
                              ? <CheckCircleIcon sx={{ fontSize: 20 }} />
                              : <HourglassEmptyIcon sx={{ fontSize: 18 }} />}
                          </Box>
                          {!isLast && (
                            <Box sx={{ width: 2, flexGrow: 1, my: 0.5, bgcolor: done ? 'success.main' : 'grey.200', minHeight: 32 }} />
                          )}
                        </Box>
                        <Box sx={{ pb: isLast ? 0 : 3, pt: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: done ? 700 : 400, color: done ? 'text.primary' : 'text.disabled' }}>
                            {step.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {step.desc}
                          </Typography>
                          {active && (
                            <Chip label="Status Saat Ini" size="small" color="success" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
