import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, List, ListItem, ListItemIcon, ListItemText,
  IconButton, Tooltip, MenuItem, FormControl, InputLabel, Select,
  Alert, Snackbar, Tabs, Tab, CircularProgress, AppBar, Toolbar
} from '@mui/material';
import {
  Visibility, Download, FilePresent, Print, Description, ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Pengajuan, Berkas } from '../lib/supabase';

interface SuratGenerated {
  id: string;
  pengajuan_id: string;
  template_used: string | null;
  konten_surat: string;
  nomor_surat: string | null;
  tanggal_surat: string;
  generated_at: string;
  generated_by: string | null;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' }> = {
  menunggu: { label: 'Menunggu', color: 'warning' },
  diproses: { label: 'Diproses', color: 'info' },
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', color: 'primary' },
  selesai: { label: 'Selesai', color: 'success' },
  ditolak: { label: 'Ditolak', color: 'error' },
};

export default function AdminPengajuanPage() {
  const navigate = useNavigate();
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);
  const [berkasList, setBerkasList] = useState<Berkas[]>([]);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [tabIndex, setTabIndex] = useState(0);
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [suratGenerated, setSuratGenerated] = useState<SuratGenerated | null>(null);
  const [letterSettings, setLetterSettings] = useState<Record<string, string>>({});
  const [generatingSurat, setGeneratingSurat] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);

  useEffect(() => { fetchPengajuan(); fetchLetterSettings(); }, []);

  const fetchLetterSettings = async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('grup', ['umum', 'surat']);
    if (data) {
      const settings: Record<string, string> = {};
      data.forEach(s => { settings[s.key] = s.value || ''; });
      setLetterSettings(settings);
    }
  };

  const fetchPengajuan = async () => {
    setLoading(true);
    let query = supabase
      .from('pengajuan')
      .select('*, layanan:layanan_master(nama_layanan, icon, template_surat)')
      .order('tanggal_diajukan', { ascending: false });

    if (statusFilter !== 'semua') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) showSnackbar('Gagal memuat: ' + error.message, 'error');
    else setPengajuanList(data || []);
    setLoading(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const openDetail = async (p: Pengajuan) => {
    setSelectedPengajuan(p);
    setCatatanAdmin(p.catatan_admin || '');
    setStatusUpdate(p.status);
    setTabIndex(0);
    setDetailOpen(true);
    setSuratGenerated(null);

    const { data } = await supabase
      .from('berkas')
      .select('*')
      .eq('pengajuan_id', p.id);
    setBerkasList(data || []);

    const { data: suratData } = await supabase
      .from('surat_generated')
      .select('*')
      .eq('pengajuan_id', p.id)
      .single();
    setSuratGenerated(suratData || null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPengajuan) return;
    setUpdating(true);
    const updates: any = {
      status: statusUpdate,
      catatan_admin: catatanAdmin || null,
    };
    if (statusUpdate === 'selesai') {
      updates.tanggal_selesai = new Date().toISOString();
    }

    const { error } = await supabase
      .from('pengajuan')
      .update(updates)
      .eq('id', selectedPengajuan.id);

    if (error) showSnackbar('Gagal update: ' + error.message, 'error');
    else {
      showSnackbar('Status pengajuan diperbarui', 'success');
      fetchPengajuan();
      setSelectedPengajuan(prev => prev ? { ...prev, ...updates } : null);
    }
    setUpdating(false);
  };

  const selectedPelayananTemplate = () => {
    const layanan = selectedPengajuan?.layanan as any;
    return layanan?.template_surat || '';
  };

  const generateOfficialSurat = async () => {
    if (!selectedPengajuan) return;
    setGeneratingSurat(true);

    try {
      const nomorSurat = suratGenerated?.nomor_surat ||
        `${letterSettings.nomor_surat_prefix || 'KTM'}/${String(new Date().getDate()).padStart(2, '0')}/${new Date().getFullYear()}`;

      const template = selectedPelayananTemplate() || generateDefaultTemplate();
      let konten = template;

      const data = { ...selectedPengajuan.data_json, ...selectedPengajuan };
      const today = new Date();
      const formattedDate = today.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      konten = konten.replace(/\[nomor_surat\]/g, nomorSurat);
      konten = konten.replace(/\[tanggal_surat\]/g, formattedDate);
      konten = konten.replace(/\[nama_lengkap\]/g, data.nama_lengkap || '');
      konten = konten.replace(/\[nik\]/g, data.nik || '');
      konten = konten.replace(/\[alamat\]/g, data.alamat || '');
      konten = konten.replace(/\[nomor_hp\]/g, data.nomor_hp || '');
      konten = konten.replace(/\[email\]/g, data.email || '');
      konten = konten.replace(/\[NAMA_INSTANSI\]/g, letterSettings.nama_instansi || 'Kelurahan Kotamatsum III');
      konten = konten.replace(/\[KECAMATAN\]/g, 'Medan Kota');
      konten = konten.replace(/\[KOTA\]/g, 'Medan');
      konten = konten.replace(/\[NAMA_LURAH\]/g, letterSettings.nama_lurah_ttd || letterSettings.nama_lurah || 'H. Ahmad Syahputra, S.Sos');
      konten = konten.replace(/\[NIP_LURAH\]/g, letterSettings.nip_lurah || '19700101 199503 1 001');

      Object.entries(data.data_json || {}).forEach(([key, val]) => {
        konten = konten.replace(new RegExp(`\\[${key}\\]`, 'g'), String(val || ''));
      });

      const { error } = await supabase
        .from('surat_generated')
        .upsert({
          pengajuan_id: selectedPengajuan.id,
          template_used: (selectedPengajuan.layanan as any)?.nama_layanan || 'default',
          konten_surat: konten,
          nomor_surat: nomorSurat,
          tanggal_surat: today.toISOString().split('T')[0],
        }, { onConflict: 'pengajuan_id' });

      if (error) throw error;

      const { data: suratData } = await supabase
        .from('surat_generated')
        .select('*')
        .eq('pengajuan_id', selectedPengajuan.id)
        .single();

      setSuratGenerated(suratData);
      showSnackbar('Surat berhasil digenerate', 'success');
    } catch (err: any) {
      showSnackbar('Gagal generate surat: ' + err.message, 'error');
    } finally {
      setGeneratingSurat(false);
    }
  };

  const generateDefaultTemplate = () => {
    return `Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], Kecamatan [KECAMATAN], Kota [KOTA], dengan ini menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]
Alamat : [alamat]

Adalah benar warga yang berdomisili di Kelurahan [NAMA_INSTANSI] sesuai alamat tersebut di atas.

Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.

                                    [NAMA_INSTANSI], [tanggal_surat]

                                    Lurah [NAMA_INSTANSI]

                                    [NAMA_LURAH]
                                    NIP. [NIP_LURAH]`;
  };

  const openPrintPreview = () => {
    setPrintPreviewOpen(true);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('surat-print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat - ${selectedPengajuan?.nomor_registrasi}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
          .letterhead { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .logo { width: 80px; height: auto; }
          .title { font-size: 14pt; font-weight: bold; margin: 5px 0; }
          .subtitle { font-size: 11pt; margin: 2px 0; }
          .content { white-space: pre-wrap; text-align: justify; }
          .signature { margin-top: 40px; text-align: right; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const filteredList = pengajuanList.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.nomor_registrasi.toLowerCase().includes(q) ||
      p.nama_lengkap.toLowerCase().includes(q) ||
      p.nik.includes(q) ||
      (p.layanan as any)?.nama_layanan?.toLowerCase().includes(q)
    );
  });

  const statusChip = (status: string) => {
    const cfg = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>Manajemen Pengajuan</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Cari nomor/nama/NIK..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select value={statusFilter} label="Filter Status" onChange={e => { setStatusFilter(e.target.value); fetchPengajuan(); }}>
            <MenuItem value="semua">Semua Status</MenuItem>
            <MenuItem value="menunggu">Menunggu</MenuItem>
            <MenuItem value="diproses">Diproses</MenuItem>
            <MenuItem value="menunggu_verifikasi">Menunggu Verifikasi</MenuItem>
            <MenuItem value="selesai">Selesai</MenuItem>
            <MenuItem value="ditolak">Ditolak</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={fetchPengajuan}>Refresh</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>No. Registrasi</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Layanan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nama</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>NIK</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tanggal</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.map(p => (
              <TableRow key={p.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{p.nomor_registrasi}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: 20 }}>{(p.layanan as any)?.icon}</span>
                    {(p.layanan as any)?.nama_layanan}
                  </Box>
                </TableCell>
                <TableCell>{p.nama_lengkap}</TableCell>
                <TableCell>{p.nik}</TableCell>
                <TableCell>{new Date(p.tanggal_diajukan).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{statusChip(p.status)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Lihat Detail">
                    <IconButton onClick={() => openDetail(p)}><Visibility /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Tidak ada pengajuan</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedPengajuan && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Detail Pengajuan {selectedPengajuan.nomor_registrasi}</span>
                {statusChip(selectedPengajuan.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                <Tab label="Data Pengaju" />
                <Tab label="Berkas" />
                <Tab label="Generate Surat" />
                <Tab label="Update Status" />
              </Tabs>

              <TabPanel value={tabIndex} index={0}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Nama Lengkap" value={selectedPengajuan.nama_lengkap} InputProps={{ readOnly: true }} margin="dense" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="NIK" value={selectedPengajuan.nik} InputProps={{ readOnly: true }} margin="dense" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="Alamat" value={selectedPengajuan.alamat} InputProps={{ readOnly: true }} margin="dense" multiline rows={2} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Nomor HP" value={selectedPengajuan.nomor_hp} InputProps={{ readOnly: true }} margin="dense" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Email" value={selectedPengajuan.email || '-'} InputProps={{ readOnly: true }} margin="dense" />
                  </Grid>
                  {Object.entries(selectedPengajuan.data_json || {}).map(([key, val]) => (
                    <Grid size={{ xs: 12, md: 6 }} key={key}>
                      <TextField fullWidth label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        value={String(val)} InputProps={{ readOnly: true }} margin="dense" />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabIndex} index={1}>
                {berkasList.length === 0 ? (
                  <Alert severity="info">Tidak ada berkas yang diupload</Alert>
                ) : (
                  <List>
                    {berkasList.map(b => (
                      <ListItem key={b.id} secondaryAction={
                        b.public_url ? (
                          <Button size="small" startIcon={<Download />} href={b.public_url} target="_blank" component="a">
                            Download
                          </Button>
                        ) : null
                      }>
                        <ListItemIcon><FilePresent /></ListItemIcon>
                        <ListItemText primary={b.nama_file} secondary={`${(b.ukuran || 0) / 1024} KB`} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </TabPanel>

              <TabPanel value={tabIndex} index={2}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Template Surat: {(selectedPengajuan.layanan as any)?.nama_layanan || 'Default'}
                  </Typography>
                  <Alert severity={suratGenerated ? 'success' : 'info'} sx={{ mb: 2 }}>
                    {suratGenerated
                      ? `Surat telah digenerate dengan nomor: ${suratGenerated.nomor_surat}`
                      : 'Klik "Generate Surat" untuk membuat surat otomatis berdasarkan data pengajuan'}
                  </Alert>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={generateOfficialSurat}
                      disabled={generatingSurat}
                      startIcon={generatingSurat ? <CircularProgress size={20} /> : <Description />}
                    >
                      {generatingSurat ? 'Generating...' : suratGenerated ? 'Update Surat' : 'Generate Surat'}
                    </Button>
                    {suratGenerated && (
                      <>
                        <Button
                          variant="outlined"
                          onClick={openPrintPreview}
                          startIcon={<Print />}
                        >
                          Preview & Print
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            const text = suratGenerated.konten_surat;
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `surat_${selectedPengajuan.nomor_registrasi}.txt`;
                            a.click();
                          }}
                          startIcon={<Download />}
                        >
                          Download TXT
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
                {suratGenerated && (
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">Preview Surat:</Typography>
                    <Box sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      whiteSpace: 'pre-wrap',
                      mt: 1,
                    }}>
                      {suratGenerated.konten_surat}
                    </Box>
                  </Paper>
                )}
              </TabPanel>

              <TabPanel value={tabIndex} index={3}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Update Status</InputLabel>
                  <Select value={statusUpdate} label="Update Status" onChange={e => setStatusUpdate(e.target.value)}>
                    <MenuItem value="menunggu">Menunggu</MenuItem>
                    <MenuItem value="diproses">Diproses</MenuItem>
                    <MenuItem value="menunggu_verifikasi">Menunggu Verifikasi</MenuItem>
                    <MenuItem value="selesai">Selesai</MenuItem>
                    <MenuItem value="ditolak">Ditolak</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth multiline rows={3} margin="normal" label="Catatan Admin"
                  value={catatanAdmin} onChange={e => setCatatanAdmin(e.target.value)}
                  placeholder="Tambahkan catatan untuk pengaju..."
                />
                <Button variant="contained" onClick={handleUpdateStatus} disabled={updating} sx={{ mt: 1 }}>
                  {updating ? <CircularProgress size={20} /> : 'Simpan Perubahan'}
                </Button>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Preview Surat</span>
            <Button variant="contained" startIcon={<Print />} onClick={handlePrint}>
              Print
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            id="surat-print-content"
            sx={{
              bgcolor: 'white',
              p: 4,
              minHeight: 800,
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.5,
            }}
          >
            <Box className="letterhead" sx={{ textAlign: 'center', borderBottom: '2px solid #000', pb: 2, mb: 3 }}>
              {letterSettings.letterhead_image && (
                <Box
                  component="img"
                  src={letterSettings.letterhead_image}
                  alt="Logo"
                  sx={{ width: 80, height: 'auto', mb: 1 }}
                />
              )}
              <Typography sx={{ fontSize: '14pt', fontWeight: 'bold', mb: 0.5 }}>
                PEMERINTAH KOTA MEDAN
              </Typography>
              <Typography sx={{ fontSize: '14pt', fontWeight: 'bold' }}>
                {letterSettings.nama_instansi || 'KELURAHAN KOTAMATSUM III'}
              </Typography>
              <Typography sx={{ fontSize: '11pt', mt: 0.5 }}>
                Kecamatan Medan Kota
              </Typography>
              <Typography sx={{ fontSize: '10pt', color: 'text.secondary' }}>
                {letterSettings.alamat_instansi || 'Jl. Kotamatsum III, Medan Kota'}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline' }}>
                SURAT KETERANGAN
              </Typography>
              <Typography sx={{ fontSize: '11pt' }}>
                Nomor: {suratGenerated?.nomor_surat}
              </Typography>
            </Box>

            <Box sx={{ whiteSpace: 'pre-wrap', textAlign: 'justify', mb: 4 }}>
              {suratGenerated?.konten_surat}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintPreviewOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
  );
}
