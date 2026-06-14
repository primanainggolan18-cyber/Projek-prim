import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { Berita } from '../lib/supabase';

const kategoriColor: Record<string, 'primary' | 'warning' | 'success' | 'secondary'> = {
  berita: 'primary',
  pengumuman: 'warning',
  agenda: 'success',
  program: 'secondary',
};

const kategoriLabel: Record<string, string> = {
  berita: 'Berita',
  pengumuman: 'Pengumuman',
  agenda: 'Agenda',
  program: 'Program',
};

interface NewsCardProps {
  item: Berita;
}

export default function NewsCard({ item }: NewsCardProps) {
  const navigate = useNavigate();

  const fallbackImg = `https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=300&fit=crop`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(`/informasi?id=${item.id}`)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          height={180}
          image={item.gambar_url || fallbackImg}
          alt={item.judul}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              label={kategoriLabel[item.kategori] || item.kategori}
              color={kategoriColor[item.kategori] || 'primary'}
              size="small"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <CalendarTodayIcon sx={{ fontSize: 12 }} />
              <Typography variant="caption">
                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.4, flexGrow: 1 }}>
            {item.judul}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {item.konten}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
