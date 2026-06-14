import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import { AuthProvider } from './lib/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProfilPage from './pages/ProfilPage';
import LayananPage from './pages/LayananPage';
import TrackingPage from './pages/TrackingPage';
import InformasiPage from './pages/InformasiPage';
import GaleriPage from './pages/GaleriPage';
import KontakPage from './pages/KontakPage';
import PengaduanPage from './pages/PengaduanPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayananPage from './pages/AdminLayananPage';
import AdminPengajuanPage from './pages/AdminPengajuanPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import LoginPage from './pages/LoginPage';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/layanan"
              element={
                <ProtectedRoute>
                  <AdminLayananPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pengajuan"
              element={
                <ProtectedRoute>
                  <AdminPengajuanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pengaturan"
              element={
                <ProtectedRoute>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pengguna"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <PublicLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profil" element={<ProfilPage />} />
                    <Route path="/layanan" element={<LayananPage />} />
                    <Route path="/tracking" element={<TrackingPage />} />
                    <Route path="/informasi" element={<InformasiPage />} />
                    <Route path="/galeri" element={<GaleriPage />} />
                    <Route path="/kontak" element={<KontakPage />} />
                    <Route path="/pengaduan" element={<PengaduanPage />} />
                  </Routes>
                </PublicLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
