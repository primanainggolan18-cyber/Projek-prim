import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import ShieldIcon from '@mui/icons-material/Shield';
import { useAuth } from '../lib/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string })?.from ?? '/admin';

  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    const { error: err } = await signIn(data.email, data.password);
    if (err) {
      setError('Email atau password salah');
      setLoading(false);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.default',
      }}
    >
      {/* Left decorative panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(160deg, #0D47A1 0%, #1565C0 40%, #0288D1 100%)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', top: '30%', right: '10%', width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,193,7,0.08)' }} />

        <Box sx={{ position: 'relative', textAlign: 'center', color: 'white', maxWidth: 380 }}>
          <AccountBalanceIcon sx={{ fontSize: 72, color: '#FFC107', mb: 3 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
            Kelurahan
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#FFC107', mb: 3, lineHeight: 1.2 }}>
            Kotamatsum III
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.8 }}>
            Portal Administrasi Digital — Kecamatan Medan Kota, Kota Medan
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 4 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: '🔐', text: 'Akses aman untuk perangkat kelurahan' },
              { icon: '📋', text: 'Kelola pengajuan layanan masyarakat' },
              { icon: '📢', text: 'Publikasi berita dan pengumuman' },
              { icon: '📊', text: 'Dashboard statistik pelayanan' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, textAlign: 'left' }}>
                <Typography sx={{ fontSize: '1.3rem' }}>{item.icon}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right login form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, flexDirection: 'column' }}>
          <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
            Kelurahan Kotamatsum III
          </Typography>
        </Box>

        <Card sx={{ width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  Masuk Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Panel Pengelola Kelurahan
                </Typography>
              </Box>
            </Box>

            <Chip
              label="Khusus Perangkat Kelurahan"
              size="small"
              color="primary"
              variant="outlined"
              icon={<LockIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ mb: 3, mt: 1 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email wajib diisi',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Format email tidak valid' },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Alamat Email"
                    type="email"
                    fullWidth
                    autoFocus
                    autoComplete="email"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password wajib diisi' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    autoComplete="current-password"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ mb: 2, py: 1.5, fontWeight: 700 }}
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              color="inherit"
              sx={{ color: 'text.secondary', borderColor: 'divider' }}
            >
              Kembali ke Website
            </Button>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.main', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#fff', display: 'block', fontWeight: 700, mb: 0.5 }}>
                Akses Terbatas
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                Panel ini hanya untuk perangkat kelurahan.
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                Hubungi administrator jika Anda memerlukan akses.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 3 }}>
          © 2026 Kelurahan Kotamatsum III — Sistem Pelayanan Digital
        </Typography>
      </Box>
    </Box>
  );
}
