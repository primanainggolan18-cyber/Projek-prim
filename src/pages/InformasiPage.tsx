import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { supabase } from '../lib/supabase';
import type { Berita } from '../lib/supabase';

const kategoriTabs = ['semua', 'berita', 'pengumuman', 'agenda', 'program'];
const kategoriLabel: Record<string, string> = { semua: 'Semua', berita: 'Berita', pengumuman: 'Pengumuman', agenda: 'Agenda', program: 'Program' };
const kategoriColor: Record<string, 'primary' | 'warning' | 'success' | 'secondary'> = { berita: 'primary', pengumuman: 'warning', agenda: 'success', program: 'secondary' };

const fallbackImg = 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=300&fit=crop';

export default function InformasiPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [berita, setBerita] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Berita | null>(null);

  useEffect(() => {
    const fetchBerita = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('berita')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (data) setBerita(data);
      setLoading(false);
    };
    fetchBerita();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && berita.length > 0) {
      const found = berita.find(b => b.id === id);
      if (found) setDetail(found);
    }
  }, [searchParams, berita]);

  const filtered = berita.filter(b => {
    const matchKategori = tab === 0 || b.kategori === kategoriTabs[tab];
    const matchSearch = !search || b.judul.toLowerCase().includes(search.toLowerCase()) || b.konten.toLowerCase().includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

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
          <Chip label="Informasi" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Berita & Pengumuman
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Informasi terkini dari Kelurahan Kotamatsum III
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Cari berita..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: 280 }}
          />
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {kategoriTabs.map((k, i) => (
            <Tab key={k} label={kategoriLabel[k]} value={i} />
          ))}
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">Tidak ada berita yang ditemukan.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((item, i) => (
              <Grid key={item.id} size={{ xs: 12, sm: i === 0 ? 12 : 6, md: i === 0 ? 8 : 4 }}>
                <Card
                  sx={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: i === 0 ? { sm: 'row' } : 'column' }}
                  onClick={() => setDetail(item)}
                >
                  <CardMedia
                    component="img"
                    image={item.gambar_url || fallbackImg}
                    alt={item.judul}
                    sx={{
                      height: i === 0 ? { xs: 200, sm: 280 } : 180,
                      width: i === 0 ? { sm: '45%' } : '100%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={kategoriLabel[item.kategori]} color={kategoriColor[item.kategori] || 'primary'} size="small" />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <CalendarTodayIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant={i === 0 ? 'h5' : 'subtitle1'} sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4 }}>
                      {item.judul}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: i === 0 ? 3 : 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.konten}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              <Chip label={kategoriLabel[detail.kategori]} color={kategoriColor[detail.kategori] || 'primary'} size="small" sx={{ mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{detail.judul}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {new Date(detail.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetail(null)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box
                component="img"
                src={detail.gambar_url || fallbackImg}
                alt={detail.judul}
                sx={{ width: '100%', borderRadius: 2, mb: 3, maxHeight: 350, objectFit: 'cover' }}
              />
              <Typography variant="body1" sx={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                {detail.konten}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
