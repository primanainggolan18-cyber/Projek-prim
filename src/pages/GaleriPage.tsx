import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { supabase } from '../lib/supabase';
import type { Galeri } from '../lib/supabase';

export default function GaleriPage() {
  const navigate = useNavigate();
  const [galeri, setGaleri] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<Galeri | null>(null);

  useEffect(() => {
    const fetchGaleri = async () => {
      setLoading(true);
      const { data } = await supabase.from('galeri').select('*').order('created_at', { ascending: false });
      if (data) setGaleri(data);
      setLoading(false);
    };
    fetchGaleri();
  }, []);

  const tabs = ['semua', 'foto', 'video'];
  const filtered = tab === 0 ? galeri : galeri.filter(g => g.tipe === tabs[tab]);

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
          <Chip label="Galeri" sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Galeri Kegiatan
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Dokumentasi kegiatan dan pelayanan Kelurahan Kotamatsum III
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Semua" />
          <Tab label="Foto" />
          <Tab label="Video" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PhotoLibraryIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography color="text.secondary">Belum ada konten galeri.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => setSelected(item)}>
                  <CardMedia
                    component="img"
                    height={220}
                    image={item.url}
                    alt={item.judul}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.judul}</Typography>
                      <Chip label={item.tipe} size="small" color={item.tipe === 'foto' ? 'primary' : 'secondary'} />
                    </Box>
                    {item.kategori && (
                      <Typography variant="caption" color="text.secondary">{item.kategori}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setSelected(null)}
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={selected.url}
              alt={selected.judul}
              sx={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'contain', bgcolor: 'black' }}
            />
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selected.judul}</Typography>
              {selected.deskripsi && (
                <Typography variant="body2" color="text.secondary">{selected.deskripsi}</Typography>
              )}
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}
