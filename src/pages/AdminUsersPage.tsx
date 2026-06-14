import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Tooltip, Chip, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem, Grid, AppBar, Toolbar
} from '@mui/material';
import {
  Add, Delete, Key, Save, Cancel, ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staf',
  });
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { showSnackbar('Sesi tidak valid', 'error'); setLoading(false); return; }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/list`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err: any) {
      showSnackbar('Gagal memuat: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAdd = () => {
    setFormData({ email: '', password: '', full_name: '', role: 'staf' });
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      showSnackbar('Semua field wajib diisi', 'error');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSnackbar('Pengguna berhasil dibuat', 'success');
      fetchUsers();
      setOpenDialog(false);
    } catch (err: any) {
      showSnackbar('Gagal: ' + err.message, 'error');
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`Yakin hapus pengguna ${user.full_name}?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSnackbar('Pengguna dihapus', 'success');
      fetchUsers();
    } catch (err: any) {
      showSnackbar('Gagal: ' + err.message, 'error');
    }
  };

  const openReset = (user: UserProfile) => {
    setSelectedUser(user);
    setResetPassword('');
    setOpenResetDialog(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !resetPassword) return;
    if (resetPassword.length < 6) {
      showSnackbar('Password minimal 6 karakter', 'error');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_id: selectedUser.id, new_password: resetPassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showSnackbar(`Password ${selectedUser.full_name} berhasil diubah`, 'success');
      setOpenResetDialog(false);
      setResetPassword('');
    } catch (err: any) {
      showSnackbar('Gagal: ' + err.message, 'error');
    }
  };

  const roleChip = (role: string) => {
    const colors: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      admin: 'error',
      lurah: 'success',
      staf: 'primary',
    };
    return <Chip label={role.toUpperCase()} color={colors[role] || 'default'} size="small" />;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>Manajemen Pengguna</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
            Tambah Pengguna
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nama Lengkap</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Peran</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Terdaftar</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{u.full_name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{roleChip(u.role)}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ganti Password">
                    <IconButton onClick={() => openReset(u)}><Key /></IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton onClick={() => handleDelete(u)} color="error"><Delete /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Belum ada pengguna</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Nama Lengkap" margin="normal"
                value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Email" type="email" margin="normal"
                value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Password" type="password" margin="normal"
                value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                helperText="Minimal 6 karakter"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Peran</InputLabel>
                <Select value={formData.role} label="Peran"
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                  <MenuItem value="staf">Staf Layanan</MenuItem>
                  <MenuItem value="lurah">Lurah</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>Batal</Button>
          <Button variant="contained" onClick={handleCreate} startIcon={<Save />}>Simpan</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ganti Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ganti password untuk <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email})
          </Typography>
          <TextField fullWidth label="Password Baru" type="password"
            value={resetPassword} onChange={e => setResetPassword(e.target.value)}
            helperText="Minimal 6 karakter"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Batal</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={!resetPassword || resetPassword.length < 6}>
            Simpan Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
}
