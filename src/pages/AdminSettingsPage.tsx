import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, TextField, Switch, FormControlLabel,
  Button, Grid, Alert, Snackbar, Card, CardContent, Divider,
  AppBar, Toolbar, IconButton
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { AdminSetting } from '../lib/supabase';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [changed, setChanged] = useState<Set<string>>(new Set());

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_settings').select('*').order('grup', { ascending: true });
    if (error) showSnackbar('Gagal memuat pengaturan: ' + error.message, 'error');
    else setSettings(data || []);
    setLoading(false);
    setChanged(new Set());
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setChanged(prev => new Set(prev).add(key));
  };

  const handleSave = async () => {
    const toSave = settings.filter(s => changed.has(s.key));
    let hasError = false;

    for (const s of toSave) {
      const { error } = await supabase
        .from('admin_settings')
        .update({ value: s.value, updated_at: new Date().toISOString() })
        .eq('key', s.key);
      if (error) { showSnackbar(`Gagal simpan ${s.label}: ${error.message}`, 'error'); hasError = true; }
    }

    if (!hasError) {
      showSnackbar('Pengaturan berhasil disimpan', 'success');
      setChanged(new Set());
    }
  };

  const renderField = (s: AdminSetting) => {
    if (s.tipe === 'boolean') {
      return (
        <FormControlLabel
          key={s.key}
          control={
            <Switch
              checked={s.value === 'true'}
              onChange={e => updateSetting(s.key, String(e.target.checked))}
            />
          }
          label={s.label || s.key}
        />
      );
    }
    if (s.tipe === 'json') {
      return (
        <TextField
          key={s.key}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          label={s.label || s.key}
          value={s.value || ''}
          onChange={e => updateSetting(s.key, e.target.value)}
          helperText={s.deskripsi || 'Format JSON'}
        />
      );
    }
    return (
      <TextField
        key={s.key}
        fullWidth
        margin="normal"
        label={s.label || s.key}
        value={s.value || ''}
        onChange={e => updateSetting(s.key, e.target.value)}
        helperText={s.deskripsi}
      />
    );
  };

  const groups = ['umum', 'tampilan', 'fitur', 'surat'];
  const groupLabels: Record<string, string> = { umum: 'Umum', tampilan: 'Tampilan & Konten', fitur: 'Fitur', surat: 'Template Surat' };

  const filteredSettings = (grup: string) => settings.filter(s => s.grup === grup);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Memuat pengaturan...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>Pengaturan Website</Typography>
          <Button variant="outlined" onClick={fetchSettings} sx={{ mr: 1 }}>Refresh</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={changed.size === 0}>
            Simpan Perubahan ({changed.size})
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Kelola konfigurasi website kelurahan secara keseluruhan
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
          {groups.map((g) => (
            <Tab key={g} label={groupLabels[g]} />
          ))}
        </Tabs>
      </Box>

      {groups.map((grup, i) => (
        <TabPanel key={grup} value={tabIndex} index={i}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{groupLabels[grup]}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {filteredSettings(grup).map(s => (
                  <Grid size={{ xs: 12, md: s.tipe === 'boolean' ? 6 : 12 }} key={s.key}>
                    {renderField(s)}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      ))}

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
