import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Switch, FormControlLabel,
  Tooltip, Alert, Snackbar, Tabs, Tab, List, ListItem,
  ListItemText, IconButton as MuiIconButton, Grid, AppBar, Toolbar
} from '@mui/material';
import {
  Add, Edit, Delete, Save, Cancel, ArrowBack
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
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth label="Tambah Persyaratan"
                value={newSyarat} onChange={e => setNewSyarat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSyarat()}
              />
              <Button variant="contained" onClick={addSyarat} startIcon={<Add />}>Tambah</Button>
            </Box>
            <List>
              {(editing.syarat || []).map((s, i) => (
                <ListItem key={i} secondaryAction={
                  <MuiIconButton edge="end" onClick={() => removeSyarat(i)}><Delete fontSize="small" /></MuiIconButton>
                }>
                  <ListItemText primary={`${i + 1}. ${s}`} />
                </ListItem>
              ))}
            </List>
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
            <Typography variant="subtitle2" gutterBottom>
              Template Surat (gunakan [nama_field] untuk placeholder data warga)
            </Typography>
            <TextField fullWidth multiline rows={12} margin="normal"
              value={editing.template_surat || ''}
              onChange={e => setEditing(p => ({ ...p, template_surat: e.target.value }))}
              placeholder={`Yang bertanda tangan di bawah ini, Lurah Kelurahan [NAMA_INSTANSI], dengan ini menerangkan bahwa:

Nama : [nama_lengkap]
NIK : [nik]
Alamat : [alamat]

Adalah benar warga Kelurahan [NAMA_INSTANSI].

Demikian surat ini dibuat.`}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                Placeholder Tersedia:
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Data Warga:
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ py: 0.25, px: 0 }}><Typography variant="caption">[nama_lengkap], [nik], [alamat]</Typography></ListItem>
                    <ListItem sx={{ py: 0.25, px: 0 }}><Typography variant="caption">[nomor_hp], [email]</Typography></ListItem>
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Data Instansi:
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ py: 0.25, px: 0 }}><Typography variant="caption">[NAMA_INSTANSI], [KECAMATAN], [KOTA]</Typography></ListItem>
                    <ListItem sx={{ py: 0.25, px: 0 }}><Typography variant="caption">[NAMA_LURAH], [NIP_LURAH]</Typography></ListItem>
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Surat:
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ py: 0.25, px: 0 }}><Typography variant="caption">[nomor_surat], [tanggal_surat]</Typography></ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
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
