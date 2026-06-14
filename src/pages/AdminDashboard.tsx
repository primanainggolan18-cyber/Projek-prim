import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip as ChartTooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EmailIcon from '@mui/icons-material/Email';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import { supabase } from '../lib/supabase';
import type { Pengajuan, Pengaduan, Berita } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend, PointElement, LineElement);

const DRAWER_WIDTH = 260;

type AdminTab = 'dashboard' | 'layanan' | 'pengaduan' | 'berita' | 'galeri' | 'pesan';

const navItems = [
  { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'layanan' as AdminTab, label: 'Pengajuan Layanan', icon: <AssignmentIcon /> },
  { id: 'pengaduan' as AdminTab, label: 'Pengaduan', icon: <ReportProblemIcon /> },
  { id: 'berita' as AdminTab, label: 'Berita & Pengumuman', icon: <AnnouncementIcon /> },
  { id: 'galeri' as AdminTab, label: 'Galeri', icon: <PhotoLibraryIcon /> },
  { id: 'pesan' as AdminTab, label: 'Pesan Kontak', icon: <EmailIcon /> },
];

const statusLayananColor: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  menunggu: 'warning', diproses: 'info', selesai: 'success', ditolak: 'error',
};

const statusPengaduanColor: Record<string, 'warning' | 'info' | 'success'> = {
  diterima: 'warning', diproses: 'info', selesai: 'success',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const { user, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [layanan, setLayanan] = useState<Pengajuan[]>([]);
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([]);
  const [berita, setBerita] = useState<Berita[]>([]);
  const [pesanList, setPesanList] = useState<{ id: string; nama: string; email: string; subjek: string; pesan: string; dibaca: boolean; created_at: string }[]>([]);
  const [, setLoading] = useState(false);
  const [editLayanan, setEditLayanan] = useState<Pengajuan | null>(null);
  const [editPengaduan, setEditPengaduan] = useState<Pengaduan | null>(null);
  const [beritaDialog, setBeritaDialog] = useState(false);
  const [editingBerita, setEditingBerita] = useState<Berita | null>(null);
  const [beritaForm, setBeritaForm] = useState({ judul: '', konten: '', kategori: 'berita', gambar_url: '' });
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();
  const { mode, setMode } = useColorScheme();

  const fetchAll = async () => {
    setLoading(true);
    const [l, p, b, m] = await Promise.all([
      supabase.from('pengajuan').select('*').order('created_at', { ascending: false }),
      supabase.from('pengaduan').select('*').order('created_at', { ascending: false }),
      supabase.from('berita').select('*').order('created_at', { ascending: false }),
      supabase.from('kontak_pesan').select('*').order('created_at', { ascending: false }),
    ]);
    if (l.data) setLayanan(l.data);
    if (p.data) setPengaduan(p.data);
    if (b.data) setBerita(b.data);
    if (m.data) setPesanList(m.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateLayananStatus = async (id: string, status: string, catatan?: string) => {
    await supabase.from('pengajuan').update({ status, catatan_admin: catatan, updated_at: new Date().toISOString() }).eq('id', id);
    setEditLayanan(null);
    fetchAll();
  };

  const updatePengaduanStatus = async (id: string, status: string, catatan?: string) => {
    await supabase.from('pengaduan').update({ status, catatan_admin: catatan, updated_at: new Date().toISOString() }).eq('id', id);
    setEditPengaduan(null);
    fetchAll();
  };

  const saveBerita = async () => {
    setSaveError('');
    if (!beritaForm.judul || !beritaForm.konten) { setSaveError('Judul dan konten wajib diisi'); return; }
    if (editingBerita) {
      await supabase.from('berita').update({ ...beritaForm, updated_at: new Date().toISOString() }).eq('id', editingBerita.id);
    } else {
      await supabase.from('berita').insert({ ...beritaForm, published: true });
    }
    setBeritaDialog(false);
    setEditingBerita(null);
    setBeritaForm({ judul: '', konten: '', kategori: 'berita', gambar_url: '' });
    fetchAll();
  };

  const deleteBerita = async (id: string) => {
    if (!window.confirm('Hapus berita ini?')) return;
    await supabase.from('berita').delete().eq('id', id);
    fetchAll();
  };

  // Stats
  const totalLayanan = layanan.length;
  const selesaiLayanan = layanan.filter(l => l.status === 'selesai').length;
  const totalPengaduan = pengaduan.length;
  const pesanBelumDibaca = pesanList.filter(p => !p.dibaca).length;

  // Charts
  const bulanList = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString('id-ID', { month: 'short' });
  });

  const layananPerBulan = bulanList.map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return layanan.filter(l => {
      const ld = new Date(l.created_at);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    }).length;
  });

  const jenisLayanan: Record<string, number> = {};
  layanan.forEach(l => { const nama = (l.layanan as any)?.nama_layanan || 'Lainnya'; jenisLayanan[nama] = (jenisLayanan[nama] || 0) + 1; });
  const topJenis = Object.entries(jenisLayanan).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, bgcolor: 'primary.dark', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <AccountBalanceIcon />
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>ADMIN PANEL</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFC107' }}>Kotamatsum III</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFC107', color: '#0D47A1' }}>
            <PersonIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
              {user?.email ?? '—'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#FFC107', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              {role ?? 'warga'}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={tab === item.id}
              onClick={() => { setTab(item.id); setMobileOpen(false); }}
              sx={{ borderRadius: 2, mx: 1, mb: 0.5, '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: tab === item.id ? 700 : 400 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ pt: 1 }}>
        <Typography variant="caption" sx={{ px: 2, py: 0.5, color: 'text.secondary', fontWeight: 600 }}>
          MANAJEMEN
        </Typography>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/admin/layanan')} sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><CategoryIcon /></ListItemIcon>
            <ListItemText primary="Master Layanan" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/admin/pengajuan')} sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><ListAltIcon /></ListItemIcon>
            <ListItemText primary="Data Pengajuan" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/admin/pengaturan')} sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Pengaturan" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/admin/pengguna')} sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Pengguna" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={() => navigate('/')} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 36 }}><HomeIcon /></ListItemIcon>
          <ListItemText primary="Kembali ke Website" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
        <ListItemButton onClick={async () => { await signOut(); navigate('/login'); }} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Keluar" primaryTypographyProps={{ fontSize: '0.875rem', color: 'error.main', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '2px 0 12px rgba(0,0,0,0.08)' } }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
              {navItems.find(n => n.id === tab)?.label || 'Dashboard'}
            </Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchAll}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={mode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
              <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={`Keluar (${user?.email ?? ''})`}>
              <IconButton
                onClick={async () => { await signOut(); navigate('/login'); }}
                color="error"
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                  { icon: <AssignmentIcon sx={{ fontSize: 28 }} />, title: 'Total Pengajuan', value: totalLayanan, color: '#1565C0' },
                  { icon: <CheckCircleIcon sx={{ fontSize: 28 }} />, title: 'Layanan Selesai', value: selesaiLayanan, color: '#2E7D32' },
                  { icon: <ReportProblemIcon sx={{ fontSize: 28 }} />, title: 'Total Pengaduan', value: totalPengaduan, color: '#ED6C02' },
                  { icon: <EmailIcon sx={{ fontSize: 28 }} />, title: 'Pesan Baru', value: pesanBelumDibaca, color: '#9C27B0' },
                ].map((item, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>{item.title}</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: item.color }}>{item.value}</Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: `${item.color}18`, color: item.color, width: 52, height: 52 }}>{item.icon}</Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pengajuan Layanan 6 Bulan Terakhir</Typography>
                      <Bar
                        data={{
                          labels: bulanList,
                          datasets: [{ label: 'Pengajuan', data: layananPerBulan, backgroundColor: '#1565C0', borderRadius: 6 }],
                        }}
                        options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Status Pengajuan</Typography>
                      <Doughnut
                        data={{
                          labels: ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'],
                          datasets: [{
                            data: [
                              layanan.filter(l => l.status === 'menunggu').length,
                              layanan.filter(l => l.status === 'diproses').length,
                              layanan.filter(l => l.status === 'selesai').length,
                              layanan.filter(l => l.status === 'ditolak').length,
                            ],
                            backgroundColor: ['#ED6C02', '#0288D1', '#2E7D32', '#D32F2F'],
                          }],
                        }}
                        options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Jenis Layanan Terbanyak</Typography>
                      {topJenis.length > 0 ? (
                        <Bar
                          data={{
                            labels: topJenis.map(([k]) => k.length > 20 ? k.substring(0, 20) + '...' : k),
                            datasets: [{ label: 'Jumlah', data: topJenis.map(([, v]) => v), backgroundColor: '#0288D1', borderRadius: 4 }],
                          }}
                          options={{ responsive: true, indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }}
                        />
                      ) : <Typography color="text.secondary">Belum ada data</Typography>}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pengaduan Terbaru</Typography>
                      {pengaduan.slice(0, 5).map((p) => (
                        <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.nama}</Typography>
                            <Typography variant="caption" color="text.secondary">{p.kategori}</Typography>
                          </Box>
                          <Chip label={p.status} color={statusPengaduanColor[p.status]} size="small" />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* LAYANAN */}
          {tab === 'layanan' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Daftar Pengajuan ({layanan.length})</Typography>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Registrasi</TableCell>
                      <TableCell>Nama</TableCell>
                      <TableCell>Jenis Layanan</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {layanan.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.nomor_registrasi}</TableCell>
                        <TableCell>{item.nama_lengkap}</TableCell>
                        <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(item.layanan as any)?.nama_layanan || '-'}</TableCell>
                        <TableCell>{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Chip label={item.status} color={statusLayananColor[item.status]} size="small" />
                        </TableCell>
                        <TableCell>
                          <Button size="small" startIcon={<EditIcon />} onClick={() => setEditLayanan(item)}>
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* PENGADUAN */}
          {tab === 'pengaduan' && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Daftar Pengaduan ({pengaduan.length})</Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Aduan</TableCell>
                      <TableCell>Nama</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pengaduan.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.nomor_aduan}</TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.kategori}</TableCell>
                        <TableCell>{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Chip label={item.status} color={statusPengaduanColor[item.status]} size="small" />
                        </TableCell>
                        <TableCell>
                          <Button size="small" startIcon={<EditIcon />} onClick={() => setEditPengaduan(item)}>
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* BERITA */}
          {tab === 'berita' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Berita & Pengumuman</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => { setEditingBerita(null); setBeritaForm({ judul: '', konten: '', kategori: 'berita', gambar_url: '' }); setBeritaDialog(true); }}
                >
                  Tambah
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Judul</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {berita.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.judul}</TableCell>
                        <TableCell><Chip label={item.kategori} size="small" color="primary" variant="outlined" /></TableCell>
                        <TableCell>{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell><Chip label={item.published ? 'Published' : 'Draft'} color={item.published ? 'success' : 'default'} size="small" /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" color="primary" onClick={() => { setEditingBerita(item); setBeritaForm({ judul: item.judul, konten: item.konten, kategori: item.kategori, gambar_url: item.gambar_url || '' }); setBeritaDialog(true); }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteBerita(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* PESAN */}
          {tab === 'pesan' && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pesan dari Masyarakat ({pesanList.length})</Typography>
              <Grid container spacing={2}>
                {pesanList.map((p) => (
                  <Grid key={p.id} size={{ xs: 12, md: 6 }}>
                    <Card sx={{ bgcolor: p.dibaca ? 'background.paper' : 'primary.main', color: p.dibaca ? 'inherit' : 'white' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.nama}</Typography>
                          {!p.dibaca && <Chip label="Baru" size="small" sx={{ bgcolor: '#FFC107', color: '#0D47A1', fontWeight: 700 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>{p.email} · {new Date(p.created_at).toLocaleDateString('id-ID')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{p.subjek}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>{p.pesan}</Typography>
                        {!p.dibaca && (
                          <Button
                            size="small"
                            sx={{ mt: 1, color: p.dibaca ? 'primary.main' : 'white', borderColor: p.dibaca ? 'primary.main' : 'rgba(255,255,255,0.5)' }}
                            variant="outlined"
                            onClick={async () => {
                              await supabase.from('kontak_pesan').update({ dibaca: true }).eq('id', p.id);
                              fetchAll();
                            }}
                          >
                            Tandai Dibaca
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {tab === 'galeri' && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Kelola Galeri</Typography>
              <Alert severity="info">
                Fitur upload gambar ke galeri tersedia. Untuk saat ini, gunakan URL gambar langsung.
              </Alert>
            </Box>
          )}
        </Box>
      </Box>

      {/* Edit Layanan Dialog */}
      <Dialog open={!!editLayanan} onClose={() => setEditLayanan(null)} maxWidth="sm" fullWidth>
        {editLayanan && (
          <AdminEditLayananDialog
            item={editLayanan}
            onClose={() => setEditLayanan(null)}
            onSave={updateLayananStatus}
          />
        )}
      </Dialog>

      {/* Edit Pengaduan Dialog */}
      <Dialog open={!!editPengaduan} onClose={() => setEditPengaduan(null)} maxWidth="sm" fullWidth>
        {editPengaduan && (
          <AdminEditPengaduanDialog
            item={editPengaduan}
            onClose={() => setEditPengaduan(null)}
            onSave={updatePengaduanStatus}
          />
        )}
      </Dialog>

      {/* Berita Dialog */}
      <Dialog open={beritaDialog} onClose={() => setBeritaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingBerita ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Judul" fullWidth value={beritaForm.judul} onChange={e => setBeritaForm(f => ({ ...f, judul: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select fullWidth value={beritaForm.kategori} onChange={e => setBeritaForm(f => ({ ...f, kategori: e.target.value }))}>
                {['berita', 'pengumuman', 'agenda', 'program'].map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="URL Gambar (opsional)" fullWidth value={beritaForm.gambar_url} onChange={e => setBeritaForm(f => ({ ...f, gambar_url: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Konten" fullWidth multiline rows={8} value={beritaForm.konten} onChange={e => setBeritaForm(f => ({ ...f, konten: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBeritaDialog(false)}>Batal</Button>
          <Button variant="contained" onClick={saveBerita}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function AdminEditLayananDialog({ item, onClose, onSave }: { item: Pengajuan; onClose: () => void; onSave: (id: string, status: string, catatan?: string) => Promise<void> }) {
  const [status, setStatus] = useState(item.status);
  const [catatan, setCatatan] = useState(item.catatan_admin || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item.id, status, catatan);
    setSaving(false);
  };

  return (
    <>
      <DialogTitle>Update Status Layanan</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>{item.nomor_registrasi}</strong> — {item.nama_lengkap} — {(item.layanan as any)?.nama_layanan || '-'}
          </Typography>
          <Select fullWidth value={status} onChange={e => setStatus(e.target.value as typeof status)} sx={{ mb: 2 }}>
            {['menunggu', 'diproses', 'selesai', 'ditolak'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <TextField
            label="Catatan Admin (opsional)"
            fullWidth
            multiline
            rows={3}
            value={catatan}
            onChange={e => setCatatan(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Simpan'}
        </Button>
      </DialogActions>
    </>
  );
}

function AdminEditPengaduanDialog({ item, onClose, onSave }: { item: Pengaduan; onClose: () => void; onSave: (id: string, status: string, catatan?: string) => Promise<void> }) {
  const [status, setStatus] = useState(item.status);
  const [catatan, setCatatan] = useState(item.catatan_admin || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item.id, status, catatan);
    setSaving(false);
  };

  return (
    <>
      <DialogTitle>Update Status Pengaduan</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>{item.nomor_aduan}</strong> — {item.nama}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>{item.deskripsi}</Typography>
          <Select fullWidth value={status} onChange={e => setStatus(e.target.value as typeof status)} sx={{ mb: 2 }}>
            {['diterima', 'diproses', 'selesai'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <TextField label="Catatan Admin" fullWidth multiline rows={3} value={catatan} onChange={e => setCatatan(e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Simpan'}
        </Button>
      </DialogActions>
    </>
  );
}
