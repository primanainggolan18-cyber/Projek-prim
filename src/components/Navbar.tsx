import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from '../lib/AuthContext';

const navItems = [
  { label: 'Beranda', path: '/', icon: <HomeIcon fontSize="small" /> },
  { label: 'Profil', path: '/profil', icon: <InfoIcon fontSize="small" /> },
  { label: 'Layanan', path: '/layanan', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Tracking', path: '/tracking', icon: <TrackChangesIcon fontSize="small" /> },
  { label: 'Informasi', path: '/informasi', icon: <AnnouncementIcon fontSize="small" /> },
  { label: 'Galeri', path: '/galeri', icon: <PhotoLibraryIcon fontSize="small" /> },
  { label: 'Pengaduan', path: '/pengaduan', icon: <ReportProblemIcon fontSize="small" /> },
  { label: 'Kontak', path: '/kontak', icon: <ContactMailIcon fontSize="small" /> },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = role === 'admin';
  const adminPath = isLoggedIn && isAdmin ? '/admin' : '/login';
  const { mode, setMode } = useColorScheme();

  const handleNav = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'primary.dark', zIndex: (theme) => theme.zIndex.appBar }}>
        <Toolbar sx={{ gap: 0.5 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: { xs: 1, md: 0 }, mr: { md: 2 } }}
            onClick={() => navigate('/')}
          >
            <AccountBalanceIcon sx={{ color: 'white', fontSize: 28 }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.1, fontSize: '0.75rem' }}>
                KELURAHAN
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#FFC107', fontWeight: 800, lineHeight: 1.1, fontSize: '0.85rem' }}>
                KOTAMATSUM III
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5, flexGrow: 1, justifyContent: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{
                  color: 'white',
                  fontSize: '0.8rem',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Tooltip title={mode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
              <IconButton
                size="small"
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                sx={{ color: 'white' }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              startIcon={isLoggedIn && isAdmin ? <DashboardIcon /> : <LockOpenIcon />}
              onClick={() => navigate(adminPath)}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                display: { xs: 'none', md: 'flex' },
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {isLoggedIn && isAdmin ? 'Dashboard' : 'Login Admin'}
            </Button>
            <IconButton
              sx={{ display: { xs: 'flex', lg: 'none' }, color: 'white' }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ bgcolor: 'primary.dark', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceIcon sx={{ color: 'white' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                KELURAHAN
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#FFC107', fontWeight: 700 }}>
                KOTAMATSUM III
              </Typography>
            </Box>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNav(item.path)}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNav(adminPath)}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isLoggedIn && isAdmin ? <DashboardIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={isLoggedIn && isAdmin ? 'Admin Dashboard' : 'Login Admin'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
