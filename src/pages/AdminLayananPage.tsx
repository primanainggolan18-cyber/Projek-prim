import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Switch, FormControlLabel,
  Tooltip, Alert, Snackbar, Tabs, Tab, List, ListItem,
  ListItemText, ListItemIcon, IconButton as MuiIconButton, Grid, AppBar, Toolbar,
  Card, CardContent, Avatar
} from '@mui/material';
import {
  Add, Edit, Delete, Save, Cancel, ArrowBack, Warning, CheckCircle,
  Description, WhatsApp, Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { LayananMaster, FieldConfig } from '../lib/supabase';

interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

const emptyLayanan: Partial<LayananMaster> = {
  nama_layanan: '',
  deskripsi: '',
  icon: '📄',
  syarat: [],
  template_surat: '',
  fields: [],
  aktif: true,
  urutan: 0,
};

const emptyField: FieldConfig = { name: '', label: '', type: 'text', required: true };

export default function AdminLayananPage() {
  const navigate = useNavigate();
  const [layananList, setLayananList] = useState<LayananMaster[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Partial<LayananMaster>>(emptyLayanan);
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [tabIndex, setTabIndex] = useState(0);
  const [newSyarat, setNewSyarat] = useState('');
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [newField, setNewField] = useState<FieldConfig>(emptyField);

  useEffect(() => { fetchLayanan(); }, []);

  const fetchLayanan = async () => {
    const { data, error } = await supabase
      .from('layanan_master')
      .select('*')
      .order('urutan', { ascending: true });
    if (error) showSnackbar('Gagal memuat layanan: ' + error.message, 'error');
    else setLayananList(data || []);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenAdd = () => {
    setEditing({ ...emptyLayanan, urutan: layananList.length + 1 });
    setFields([]);
    setNewSyarat('');
    setNewField(emptyField);
    setIsEdit(false);
    setTabIndex(0);
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: LayananMaster) => {
    setEditing({ ...item });
    setFields(item.fields || []);
    setNewSyarat('');
    setNewField(emptyField);
    setIsEdit(true);
    setTabIndex(0);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!editing.nama_layanan?.trim()) {
      showSnackbar('Nama layanan wajib diisi', 'error');
      return;
    }
    const payload = {
      ...editing,
      fields,
      syarat: editing.syarat || [],
    };
    if (isEdit && editing.id) {
      const { error } = await supabase.from('layanan_master').update(payload).eq('id', editing.id);
      if (error) showSnackbar('Gagal update: ' + error.message, 'error');
      else { showSnackbar('Layanan berhasil diperbarui', 'success'); fetchLayanan(); setOpenDialog(false); }
    } else {
      const { error } = await supabase.from('layanan_master').insert(payload);
      if (error) showSnackbar('Gagal tambah: ' + error.message, 'error');
      else { showSnackbar('Layanan berhasil ditambahkan', 'success'); fetchLayanan(); setOpenDialog(false); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus layanan ini?')) return;
    const { error } = await supabase.from('layanan_master').delete().eq('id', id);
    if (error) showSnackbar('Gagal hapus: ' + error.message, 'error');
    else { showSnackbar('Layanan dihapus', 'success'); fetchLayanan(); }
  };

  const addSyarat = () => {
    if (!newSyarat.trim()) return;
    setEditing(prev => ({ ...prev, syarat: [...(prev.syarat || []), newSyarat.trim()] }));
    setNewSyarat('');
  };

  const removeSyarat = (idx: number) => {
    setEditing(prev => ({ ...prev, syarat: (prev.syarat || []).filter((_, i) => i !== idx) }));
  };

  const addField = () => {
    if (!newField.name.trim() || !newField.label.trim()) return;
    setFields(prev => [...prev, { ...newField }]);
    setNewField(emptyField);
  };

  const removeField = (idx: number) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  const statusChip = (aktif: boolean) => (
    <Chip label={aktif ? 'Aktif' : 'Nonaktif'} color={aktif ? 'success' : 'default'} size="small" />
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>Master Layanan</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
            Tambah Layanan
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Urutan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ikon</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nama Layanan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Persyaratan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {layananList.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.urutan}</TableCell>
                <TableCell sx={{ fontSize: 24 }}>{item.icon}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{item.nama_layanan}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.deskripsi}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {item.syarat?.map((s, i) => (
                      <Chip key={i} label={s} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{statusChip(item.aktif)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenEdit(item)}><Edit /></IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton onClick={() => handleDelete(item.id)} color="error"><Delete /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {layananList.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Belum ada layanan</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
        <DialogContent>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
            <Tab label="Informasi" />
            <Tab label="Persyaratan" />
            <Tab label="Formulir" />
            <Tab label="Template Surat" />
          </Tabs>

          <TabPanel value={tabIndex} index={0}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField fullWidth label="Nama Layanan" margin="normal"
                  value={editing.nama_layanan || ''}
                  onChange={e => setEditing(p => ({ ...p, nama_layanan: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Ikon (emoji)" margin="normal"
                  value={editing.icon || ''}
                  onChange={e => setEditing(p => ({ ...p, icon: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Deskripsi" margin="normal" multiline rows={2}
                  value={editing.deskripsi || ''}
                  onChange={e => setEditing(p => ({ ...p, deskripsi: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Urutan" type="number" margin="normal"
                  value={editing.urutan || 0}
                  onChange={e => setEditing(p => ({ ...p, urutan: parseInt(e.target.value) || 0 }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <FormControlLabel
                  control={<Switch checked={editing.aktif ?? true}
                    onChange={e => setEditing(p => ({ ...p, aktif: e.target.checked }))} />}
                  label="Aktif"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            {/* Persyaratan Info */}
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<Info />}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Tentang Persyaratan Dokumen:
              </Typography>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="info" /></ListItemIcon>
                  <ListItemText
                    primary="Daftar semua dokumen yang HARUS dibawa warga ke kelurahan"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="info" /></ListItemIcon>
                  <ListItemText
                    primary="Warga akan dihubungi via WhatsApp jika dokumen kurang/tidak lengkap"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}><WhatsApp fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Nomor WhatsApp warga WAJIB diisi untuk komunikasi"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Alert>

            {/* Standard Requirements */}
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <Box sx={{ bgcolor: 'warning.light', p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
                  Dokumen Standar (Otomatis Diperlukan):
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {['KTP (Kartu Tanda Penduduk)', 'KK (Kartu Keluarga)', 'Surat Pengantar RT/RW (jika diperlukan)'].map((doc, i) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={i}>
                      <Chip
                        icon={<CheckCircle />}
                        label={doc}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  * Dokumen di atas otomatis muncul sebagai pengingat warga. Tambahkan persyaratan khusus di bawah.
                </Typography>
              </Box>
            </Card>

            {/* Custom Requirements */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Persyaratan Khusus Layanan Ini:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Tambah Persyaratan Dokumen"
                placeholder="Contoh: Surat keterangan tidak mampu dari Lurah"
                value={newSyarat}
                onChange={e => setNewSyarat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSyarat()}
              />
              <Button variant="contained" onClick={addSyarat} startIcon={<Add />}>Tambah</Button>
            </Box>

            {(editing.syarat || []).length > 0 ? (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Daftar Persyaratan ({(editing.syarat || []).length} item)
                    </Typography>
                  </Box>
                </Box>
                <List sx={{ p: 0 }}>
                  {(editing.syarat || []).map((s, i) => (
                    <ListItem
                      key={i}
                      sx={{
                        bgcolor: i % 2 === 0 ? 'grey.50' : 'transparent',
                        borderBottom: i === (editing.syarat || []).length - 1 ? 0 : 1,
                        borderBottomColor: 'divider'
                      }}
                      secondaryAction={
                        <MuiIconButton edge="end" onClick={() => removeSyarat(i)} color="error">
                          <Delete fontSize="small" />
                        </MuiIconButton>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                          {i + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={s}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 2 }} icon={<Warning />}>
                Belum ada persyaratan khusus. Tambahkan dokumen yang diperlukan untuk layanan ini.
              </Alert>
            )}

            {/* Notice about WhatsApp */}
            <Card sx={{ mt: 3, bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WhatsApp color="success" />
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    WhatsApp Contact Notice
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Sistem otomatis menampilkan pemberitahuan bahwa staf kelurahan akan menghubungi warga via WhatsApp jika:
                </Typography>
                <List dense disablePadding sx={{ mt: 1 }}>
                  <ListItem disablePadding sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText primary="Dokumen yang diupload kurang atau tidak lengkap" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText primary="Foto/scan dokumen tidak jelas atau tidak sesuai" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText primary="Diperlukan dokumen tambahan" primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabIndex} index={2}>
            <Typography variant="subtitle2" gutterBottom>Field Input Pengajuan</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <TextField label="Nama Field" size="small" sx={{ width: 200 }}
                value={newField.name} onChange={e => setNewField(p => ({ ...p, name: e.target.value }))}
              />
              <TextField label="Label" size="small" sx={{ width: 200 }}
                value={newField.label} onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
              />
              <TextField label="Tipe" size="small" select sx={{ width: 120 }} SelectProps={{ native: true }}
                value={newField.type} onChange={e => setNewField(p => ({ ...p, type: e.target.value as any }))}
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </TextField>
              <FormControlLabel
                control={<Switch checked={newField.required}
                  onChange={e => setNewField(p => ({ ...p, required: e.target.checked }))} />}
                label="Wajib"
              />
              <Button variant="contained" size="small" onClick={addField} startIcon={<Add />}>Tambah Field</Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Tipe</TableCell>
                    <TableCell>Wajib</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.label}</TableCell>
                      <TableCell>{f.type}</TableCell>
                      <TableCell>{f.required ? 'Ya' : 'Tidak'}</TableCell>
                      <TableCell align="right">
                        <MuiIconButton size="small" onClick={() => removeField(i)}><Delete fontSize="small" /></MuiIconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fields.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">Belum ada field</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabIndex} index={3}>
            {/* Template Info */}
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<Info />}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Template Surat Otomatis
              </Typography>
              <Typography variant="body2">
                Template ini akan digunakan untuk membuat surat otomatis saat pengajuan disetujui.
                Sistem akan mengganti placeholder dengan data pemohon.
              </Typography>
            </Alert>

            {/* Sample Templates */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Template Contoh (Klik untuk gunakan):
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Chip
                  label="Surat Keterangan Domisili"
                  onClick={() => setEditing(p => ({ ...p, template_surat: `Yang bertanda tangan di bawah ini, Lurah [NAMA_INSTANSI] dengan ini menerangkan bahwa:

Nama          : [nama_lengkap]
NIK           : [nik]
Alamat        : [alamat]
No. HP        : [nomor_hp]

Adalah benar warga yang berdomisili di wilayah Kelurahan [NAMA_INSTANSI], Kecamatan [KECAMATAN], [KOTA].

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.

                                            [NAMA_INSTANSI], [tanggal_surat]

                                            Lurah [NAMA_INSTANSI]

                                            [NAMA_LURAH]
                                            NIP. [NIP_LURAH]` }))}
                  color="primary"
                  variant="outlined"
                  clickable
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Chip
                  label="Surat Keterangan Tidak Mampu"
                  onClick={() => setEditing(p => ({ ...p, template_surat: `Yang bertanda tangan di bawah ini, Lurah [NAMA_INSTANSI] dengan ini menerangkan bahwa:

Nama          : [nama_lengkap]
NIK           : [nik]
Tempat/Tgl Lahir :
Jenis Kelamin :
Alamat        : [alamat]

Adalah benar warga Kelurahan [NAMA_INSTANSI] yang keadaan ekonominya TIDAK MAMPU.

Surat keterangan ini dibuat untuk keperluan: [keperluan]

Demikian surat ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.

                                            [NAMA_INSTANSI], [tanggal_surat]

                                            Lurah [NAMA_INSTANSI]

                                            [NAMA_LURAH]
                                            NIP. [NIP_LURAH]` }))}
                  color="secondary"
                  variant="outlined"
                  clickable
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Chip
                  label="Surat Pengantar SKCK"
                  onClick={() => setEditing(p => ({ ...p, template_surat: `SURAT PENGANTAR
PENGAJUAN SKCK

Nomor      : [nomor_surat]

Yang bertanda tangan di bawah ini, Lurah [NAMA_INSTANSI] menerangkan bahwa:

Nama          : [nama_lengkap]
NIK           : [nik]
Alamat        : [alamat]

Adalah warga Kelurahan [NAMA_INSTANSI] yang berperilaku baik dan tidak pernah terlibat tindak pidana.

Surat pengantar ini dibuat untuk mengajukan SKCK kepada Kepolisian.

                                            [NAMA_INSTANSI], [tanggal_surat]

                                            Lurah [NAMA_INSTANSI]

                                            [NAMA_LURAH]
                                            NIP. [NIP_LURAH]` }))}
                  color="success"
                  variant="outlined"
                  clickable
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Chip
                  label="Surat Keterangan Usaha"
                  onClick={() => setEditing(p => ({ ...p, template_surat: `SURAT KETERANGAN USAHA

Nomor      : [nomor_surat]

Yang bertanda tangan di bawah ini, Lurah [NAMA_INSTANSI] dengan ini menerangkan bahwa:

Nama          : [nama_lengkap]
NIK           : [nik]
Alamat        : [alamat]

Adalah benar warga Kelurahan [NAMA_INSTANSI] yang memiliki usaha:
Jenis Usaha   : [jenis_usaha]
Alamat Usaha  : [alamat_usaha]

Surat ini dibuat untuk keperluan: [keperluan]

                                            [NAMA_INSTANSI], [tanggal_surat]

                                            Lurah [NAMA_INSTANSI]

                                            [NAMA_LURAH]
                                            NIP. [NIP_LURAH]` }))}
                  color="warning"
                  variant="outlined"
                  clickable
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Chip
                  label="Surat Keterangan Kelahiran"
                  onClick={() => setEditing(p => ({ ...p, template_surat: `SURAT KETERANGAN KELAHIRAN

Yang bertanda tangan di bawah ini, Lurah [NAMA_INSTANSI] menerangkan bahwa pada:

Hari          :
Tanggal       :
Pukul         :
Tempat        :

Telah lahir seorang anak dengan keterangan:
Nama Bayi     : [nama_bayi]
Jenis Kelamin :
Ayah          : [nama_lengkap]
NIK Ayah      : [nik]
Ibu           : [nama_ibu]
NIK Ibu       : [nik_ibu]
Alamat        : [alamat]

Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.

                                            [NAMA_INSTANSI], [tanggal_surat]

                                            Lurah [NAMA_INSTANSI]

                                            [NAMA_LURAH]
                                            NIP. [NIP_LURAH]` }))}
                  color="error"
                  variant="outlined"
                  clickable
                />
              </Grid>
            </Grid>

            {/* Template Editor */}
            <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Editor Template Surat
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  margin="normal"
                  value={editing.template_surat || ''}
                  onChange={e => setEditing(p => ({ ...p, template_surat: e.target.value }))}
                  placeholder={`Ketik template surat di sini...
Gunakan placeholder dalam format [nama_placeholder]
Contoh: [nama_lengkap], [nik], [alamat]`}
                  InputProps={{
                    sx: { fontFamily: 'monospace', fontSize: '0.9rem' }
                  }}
                />
              </Box>
            </Card>

            {/* Placeholder Reference */}
            <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
              <Box sx={{ bgcolor: 'grey.100', p: 1.5, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Daftar Placeholder yang Tersedia
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" fontWeight={700} color="primary" display="block" gutterBottom>
                      Data Identitas Pemohon:
                    </Typography>
                    <List dense disablePadding>
                      {['[nama_lengkap] - Nama lengkap', '[nik] - NIK', '[alamat] - Alamat lengkap', '[nomor_hp] - Nomor HP/WA', '[email] - Email'].map((p, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                          <ListItemText primary={<Typography variant="caption" fontFamily="monospace">{p}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" fontWeight={700} color="secondary" display="block" gutterBottom>
                      Data Instansi:
                    </Typography>
                    <List dense disablePadding>
                      {['[NAMA_INSTANSI] - Nama Kelurahan', '[KECAMATAN] - Nama Kecamatan', '[KOTA] - Nama Kota', '[NAMA_LURAH] - Nama Lurah', '[NIP_LURAH] - NIP Lurah'].map((p, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="secondary" /></ListItemIcon>
                          <ListItemText primary={<Typography variant="caption" fontFamily="monospace">{p}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" fontWeight={700} color="warning.dark" display="block" gutterBottom>
                      Data Surat:
                    </Typography>
                    <List dense disablePadding>
                      {['[nomor_surat] - Nomor surat otomatis', '[tanggal_surat] - Tanggal surat', '[keperluan] - Keperluan (jika ada)', '[jenis_usaha] - Jenis usaha (jika ada)'].map((p, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                          <ListItemText primary={<Typography variant="caption" fontFamily="monospace">{p}</Typography>} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>

                {/* Custom Fields */}
                {fields.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={700} color="info.main" display="block" gutterBottom>
                      Field Kustom dari Layanan Ini:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {fields.map((f, i) => (
                        <Chip
                          key={i}
                          label={`[${f.name}]`}
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={() => {
                            const template = editing.template_surat || '';
                            setEditing(p => ({ ...p, template_surat: template + `[${f.name}]` }));
                          }}
                          sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      * Klik chip untuk menambahkan ke template
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>

            {/* Preview */}
            {(editing.template_surat || '').length > 0 && (
              <Card sx={{ borderRadius: 2, border: 2, borderColor: 'primary.light' }}>
                <Box sx={{ bgcolor: 'primary.light', color: 'white', p: 1.5, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Preview Template (dengan data contoh)
                  </Typography>
                </Box>
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                  <Paper sx={{ p: 3, boxShadow: 3, minHeight: 200 }}>
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        m: 0
                      }}
                    >
                      {(editing.template_surat || '')
                        .replace('[nama_lengkap]', 'AHMAD SUDRAJAT')
                        .replace('[nik]', '3201234567890001')
                        .replace('[alamat]', 'Jl. Merdeka No. 123, RT 01/RW 02')
                        .replace('[nomor_hp]', '08123456789')
                        .replace('[email]', 'ahmad@email.com')
                        .replace('[NAMA_INSTANSI]', 'Kelurahan Sukamaju')
                        .replace('[KECAMATAN]', 'Kecamatan Cimahi Tengah')
                        .replace('[KOTA]', 'Kota Cimahi')
                        .replace('[NAMA_LURAH]', 'Drs. H. SUGENG')
                        .replace('[NIP_LURAH]', '196501011990031001')
                        .replace('[nomor_surat]', '001/KEL-SKM/VI/2026')
                        .replace('[tanggal_surat]', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))}
                    </Typography>
                  </Paper>
                </Box>
              </Card>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>Batal</Button>
          <Button variant="contained" onClick={handleSave} startIcon={<Save />}>Simpan</Button>
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
