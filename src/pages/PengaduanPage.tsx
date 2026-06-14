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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase, generateNomorAduan } from '../lib/supabase';

const kategoriAduan = [
  'Infrastruktur & Jalan',
  'Kebersihan & Sampah',
  'Keamanan & Ketertiban',
  'Pelayanan Administrasi',
  'Air & Sanitasi',
  'Penerangan Jalan',
  'Program Sosial',
  'Lainnya',
];

interface AduanForm {
  nama: string;
  nomor_hp: string;
  kategori: string;
  deskripsi: string;
}

export default function PengaduanPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [nomorAduan, setNomorAduan] = useState('');
  const [error, setError] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AduanForm>({
    defaultValues: { nama: '', nomor_hp: '', kategori: '', deskripsi: '' },
  });

  const onSubmit = async (data: AduanForm) => {
    setLoading(true);
    setError('');
    try {
      const nomor = generateNomorAduan();
      const { error: err } = await supabase.from('pengaduan').insert({
        nomor_aduan: nomor,
        nama: data.nama,
        nomor_hp: data.nomor_hp,
        kategori: data.kategori,
        deskripsi: data.deskripsi,
        status: 'diterima',
      });
      if (err) throw err;
      setNomorAduan(nomor);
      setSuccessDialog(true);
      reset();
    } catch {
      setError('Gagal mengirim pengaduan. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ background: 'linear-gradient(135deg, #B71C1C, #C62828)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Kembali
          </Button>
          <Chip label="Pengaduan Masyarakat" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Sistem Pengaduan Online
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Sampaikan keluhan dan aspirasi Anda kepada pemerintah kelurahan
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Chip label="Panduan" color="error" size="small" sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Cara Mengajukan Pengaduan
              </Typography>
              {[
                { step: '1', title: 'Isi Formulir', desc: 'Lengkapi formulir pengaduan dengan informasi yang jelas dan lengkap' },
                { step: '2', title: 'Kirim Pengaduan', desc: 'Klik tombol kirim dan simpan nomor aduan yang diberikan' },
                { step: '3', title: 'Pantau Status', desc: 'Gunakan nomor aduan untuk memantau perkembangan penanganan' },
              ].map((item) => (
                <Box key={item.step} sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                  <Avatar sx={{ bgcolor: 'error.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                    {item.step}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Perhatian</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>
                  Pastikan pengaduan yang disampaikan adalah fakta yang benar dan dapat dipertanggungjawabkan. Pengaduan palsu dapat dikenakan sanksi hukum.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <ReportProblemIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Formulir Pengaduan
                  </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="nama"
                        control={control}
                        rules={{ required: 'Nama wajib diisi' }}
                        render={({ field }) => (
                          <TextField {...field} label="Nama Lengkap" fullWidth error={!!errors.nama} helperText={errors.nama?.message} />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="nomor_hp"
                        control={control}
                        rules={{ required: 'Nomor HP wajib diisi' }}
                        render={({ field }) => (
                          <TextField {...field} label="Nomor HP / WhatsApp" fullWidth error={!!errors.nomor_hp} helperText={errors.nomor_hp?.message} />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="kategori"
                        control={control}
                        rules={{ required: 'Kategori wajib dipilih' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.kategori}>
                            <InputLabel>Kategori Pengaduan</InputLabel>
                            <Select {...field} label="Kategori Pengaduan">
                              {kategoriAduan.map(k => (
                                <MenuItem key={k} value={k}>{k}</MenuItem>
                              ))}
                            </Select>
                            {errors.kategori && <FormHelperText>{errors.kategori.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="deskripsi"
                        control={control}
                        rules={{ required: 'Deskripsi pengaduan wajib diisi', minLength: { value: 20, message: 'Deskripsi minimal 20 karakter' } }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Deskripsi Pengaduan"
                            fullWidth
                            multiline
                            rows={5}
                            error={!!errors.deskripsi}
                            helperText={errors.deskripsi?.message || 'Jelaskan pengaduan Anda secara detail (lokasi, waktu, dll)'}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" sx={{ mb: 1 }}>
                        Identitas pelapor akan dijaga kerahasiaannya sesuai peraturan yang berlaku.
                      </Alert>
                      <Button
                        type="submit"
                        variant="contained"
                        color="error"
                        size="large"
                        fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      >
                        {loading ? 'Mengirim...' : 'Kirim Pengaduan'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
            Pengaduan Terkirim!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Pengaduan Anda telah diterima. Simpan nomor aduan berikut:
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'error.main', borderRadius: 2, display: 'inline-block' }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2 }}>
              {nomorAduan}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Tim kami akan menangani pengaduan Anda dalam 1-5 hari kerja.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" color="error" onClick={() => setSuccessDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
