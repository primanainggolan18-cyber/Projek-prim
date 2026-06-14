import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Card, CardContent, CardActionArea,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Stepper, Step, StepLabel, Paper, Alert, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, Divider, IconButton,
  Chip, Badge, Accordion, AccordionSummary,
  AccordionDetails, Avatar, InputAdornment
} from '@mui/material';
import {
  CloudUpload, CheckCircle,
  ArrowForward, Close, FilePresent, PictureAsPdf, ArrowBack,
  ExpandMore, Warning, Info, Description, Assignment, WhatsApp
} from '@mui/icons-material';
import { supabase, generateNomorRegistrasi } from '../lib/supabase';
import type { LayananMaster, FieldConfig } from '../lib/supabase';

const steps = ['Pilih Layanan', 'Isi Formulir', 'Upload Berkas', 'Konfirmasi'];

export default function LayananPage() {
  const navigate = useNavigate();
  const [layananList, setLayananList] = useState<LayananMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLayanan, setSelectedLayanan] = useState<LayananMaster | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [error, setError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLayanan, setDetailLayanan] = useState<LayananMaster | null>(null);

  useEffect(() => {
    fetchLayanan();
  }, []);

  const fetchLayanan = async () => {
    const { data, error } = await supabase
      .from('layanan_master')
      .select('*')
      .eq('aktif', true)
      .order('urutan', { ascending: true });
    if (!error) setLayananList(data || []);
    setLoading(false);
  };

  const handleSelectLayanan = (layanan: LayananMaster) => {
    setSelectedLayanan(layanan);
    setFormData({});
    setFiles([]);
    setError('');
    setActiveStep(1);
  };

  const handleFormChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

      const newFiles = Array.from(e.target.files).filter(file => {
        if (!allowedTypes.includes(file.type)) {
          setError(`File "${file.name}" tidak didukung. Hanya JPG, PNG, dan PDF yang diizinkan.`);
          return false;
        }
        if (file.size > maxFileSize) {
          setError(`File "${file.name}" terlalu besar. Maksimal 5MB per file.`);
          return false;
        }
        return true;
      });

      setFiles(prev => [...prev, ...newFiles]);
      e.target.value = ''; // Reset input
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    if (!selectedLayanan) return false;
    const requiredFields = selectedLayanan.fields?.filter(f => f.required) || [];
    for (const field of requiredFields) {
      if (!formData[field.name]?.toString().trim()) {
        setError(`Field "${field.label}" wajib diisi`);
        return false;
      }
    }
    if (!formData.nama_lengkap || !formData.nik || !formData.alamat || !formData.nomor_hp) {
      setError('Data identitas wajib lengkap');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedLayanan) return;
    setSubmitting(true);
    setError('');

    try {
      const nomor = generateNomorRegistrasi();
      const { data: pengajuanData, error: pengajuanError } = await supabase
        .from('pengajuan')
        .insert({
          nomor_registrasi: nomor,
          layanan_id: selectedLayanan.id,
          nama_lengkap: formData.nama_lengkap,
          nik: formData.nik,
          alamat: formData.alamat,
          nomor_hp: formData.nomor_hp,
          email: formData.email || null,
          data_json: formData,
          keterangan: formData.keterangan || null,
          status: 'menunggu',
        })
        .select()
        .single();

      if (pengajuanError) throw pengajuanError;

      // Upload files
      if (files.length > 0 && pengajuanData) {
        for (const file of files) {
          const filePath = `pengajuan/${pengajuanData.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('berkas')
            .upload(filePath, file);

          if (uploadError) {
            console.warn('Upload error:', uploadError.message);
            continue;
          }

          const { data: urlData } = supabase.storage.from('berkas').getPublicUrl(filePath);

          await supabase.from('berkas').insert({
            pengajuan_id: pengajuanData.id,
            nama_file: file.name,
            tipe_berkas: file.type,
            ukuran: file.size,
            storage_path: filePath,
            public_url: urlData?.publicUrl || null,
          });
        }
      }

      setNomorRegistrasi(nomor);
      setSuccess(true);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const val = formData[field.name] || '';
    if (field.type === 'textarea') {
      return (
        <TextField key={field.name} fullWidth multiline rows={3} margin="normal"
          label={field.label + (field.required ? ' *' : '')}
          value={val} required={field.required}
          onChange={e => handleFormChange(field.name, e.target.value)}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <TextField key={field.name} fullWidth select margin="normal" SelectProps={{ native: true }}
          label={field.label + (field.required ? ' *' : '')}
          value={val} required={field.required}
          onChange={e => handleFormChange(field.name, e.target.value)}
        >
          <option value="">Pilih...</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </TextField>
      );
    }
    return (
      <TextField key={field.name} fullWidth margin="normal"
        label={field.label + (field.required ? ' *' : '')}
        type={field.type} value={val} required={field.required}
        onChange={e => handleFormChange(field.name, e.target.value)}
      />
    );
  };

  const openDetail = (layanan: LayananMaster) => {
    setDetailLayanan(layanan);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        size="small"
        sx={{ mb: 2 }}
      >
        Kembali
      </Button>
      <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
        Pelayanan Online
      </Typography>
      <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
        Ajukan permohonan layanan administrasi secara online dengan mudah
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={3}>
          {layananList.map(layanan => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={layanan.id}>
              <Card sx={{
                height: '100%',
                transition: 'all 0.3s',
                border: 2,
                borderColor: 'transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.main',
                  boxShadow: 4
                }
              }}>
                <CardActionArea onClick={() => handleSelectLayanan(layanan)} sx={{ p: 2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Badge
                      badgeContent={layanan.syarat?.length || 0}
                      color="primary"
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 1 }}>
                        <Typography sx={{ fontSize: 32 }}>{layanan.icon}</Typography>
                      </Avatar>
                    </Badge>
                    <Typography variant="h6" fontWeight={700} gutterBottom>{layanan.nama_layanan}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {layanan.deskripsi}
                    </Typography>

                    {/* Persyaratan Quick Info */}
                    {layanan.syarat && layanan.syarat.length > 0 && (
                      <Box sx={{
                        bgcolor: 'primary.50',
                        borderRadius: 2,
                        p: 1.5,
                        mb: 2,
                        border: 1,
                        borderColor: 'primary.100'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Description color="primary" fontSize="small" />
                          <Typography variant="caption" fontWeight={700} color="primary">
                            Persyaratan Lengkap:
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {layanan.syarat.slice(0, 3).map((s, i) => (
                            <Chip
                              key={i}
                              label={s}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontSize: '0.65rem', height: 24 }}
                            />
                          ))}
                          {layanan.syarat.length > 3 && (
                            <Chip
                              label={`+${layanan.syarat.length - 3} lainnya`}
                              size="small"
                              color="secondary"
                              sx={{ fontSize: '0.65rem', height: 24 }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ArrowForward />}
                      fullWidth
                    >
                      Ajukan Sekarang
                    </Button>
                  </CardContent>
                </CardActionArea>

                {/* Expandable Detailed Requirements */}
                {layanan.syarat && layanan.syarat.length > 0 && (
                  <Accordion elevation={0} sx={{ '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info color="action" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Lihat semua persyaratan
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Persyaratan ({layanan.syarat.length} item):
                      </Typography>
                      <List dense disablePadding>
                        {layanan.syarat.map((s, i) => (
                          <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <CheckCircle fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={s}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => openDetail(layanan)}
                        startIcon={<Assignment />}
                      >
                        Lihat Detail Lengkap
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeStep === 1 && selectedLayanan && (
        <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Formulir {selectedLayanan.nama_layanan}</Typography>
            <Button size="small" onClick={() => setActiveStep(0)}>Kembali</Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Important Notice */}
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              PENTING - BACA SEBELUM MENGAJUKAN:
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                <ListItemText
                  primary="Dokumen asli HARUS dibawa ke kantor kelurahan saat pengambilan surat"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                <ListItemText
                  primary="Staf kelurahan akan menghubungi Anda via WhatsApp jika dokumen kurang/tidak lengkap"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                <ListItemText
                  primary="Pastikan nomor WhatsApp aktif dan bisa dihubungi"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Alert>

          <Typography variant="subtitle2" gutterBottom color="primary">Data Identitas</Typography>
          <TextField fullWidth margin="normal" label="Nama Lengkap *" value={formData.nama_lengkap || ''}
            onChange={e => handleFormChange('nama_lengkap', e.target.value)} required />
          <TextField fullWidth margin="normal" label="NIK *" value={formData.nik || ''}
            onChange={e => handleFormChange('nik', e.target.value)} required />
          <TextField fullWidth margin="normal" label="Alamat Lengkap *" multiline rows={2}
            value={formData.alamat || ''} onChange={e => handleFormChange('alamat', e.target.value)} required />

          {/* WhatsApp Field - Prominent */}
          <Card sx={{ mt: 2, mb: 2, border: 2, borderColor: 'success.main', bgcolor: 'success.50' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WhatsApp color="success" sx={{ fontSize: 28 }} />
                <Typography variant="subtitle1" fontWeight={700} color="success.main">
                  Nomor WhatsApp (WAJIB)
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Nomor WhatsApp *"
                placeholder="Contoh: 08123456789"
                value={formData.nomor_hp || ''}
                onChange={e => handleFormChange('nomor_hp', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WhatsApp color="success" />
                    </InputAdornment>
                  ),
                }}
                helperText="Staf kelurahan akan menghubungi via WhatsApp jika ada kekurangan dokumen atau persyaratan tidak sesuai"
              />
            </CardContent>
          </Card>

          <TextField fullWidth margin="normal" label="Email" type="email" value={formData.email || ''}
            onChange={e => handleFormChange('email', e.target.value)} />

          {selectedLayanan.fields && selectedLayanan.fields.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
                Data Tambahan
              </Typography>
              {selectedLayanan.fields.map(renderField)}
            </>
          )}

          <TextField fullWidth margin="normal" label="Keterangan Tambahan" multiline rows={2}
            value={formData.keterangan || ''} onChange={e => handleFormChange('keterangan', e.target.value)} />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button onClick={() => setActiveStep(0)}>Batal</Button>
            <Button variant="contained" onClick={() => {
              if (validateForm()) setActiveStep(2);
            }}>Lanjut ke Upload</Button>
          </Box>
        </Paper>
      )}

      {activeStep === 2 && selectedLayanan && (
        <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>Upload Berkas Persyaratan</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload dokumen persyaratan yang diperlukan untuk {selectedLayanan.nama_layanan}
          </Typography>

          {/* Document Notice */}
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              PERHATIAN - DOKUMEN ASLI WAJIB DIBAWA KE KELURAHAN!
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Dokumen yang diupload hanya sebagai lampiran verifikasi awal. Anda WAJIB membawa dokumen asli ke kantor kelurahan saat:
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Pengambilan surat yang sudah jadi" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Verifikasi kelengkapan dokumen" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
          </Alert>

          {/* WhatsApp Contact Notice */}
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<WhatsApp />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              HUBUNGIAN VIA WHATSAPP
            </Typography>
            <Typography variant="body2">
              Staf kelurahan akan menghubungi Anda via WhatsApp jika:
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="info" /></ListItemIcon>
                <ListItemText primary="Dokumen yang diupload kurang atau tidak lengkap" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="info" /></ListItemIcon>
                <ListItemText primary="Foto/scan dokumen tidak jelas atau tidak sesuai" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="info" /></ListItemIcon>
                <ListItemText primary="Diperlukan dokumen tambahan" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Persyaratan yang diperlukan ({selectedLayanan.syarat?.length || 0} item):
            </Typography>
            <List dense>
              {selectedLayanan.syarat?.map((s, i) => (
                <ListItem key={i}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                      {i + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={s} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                const validFiles = Array.from(e.dataTransfer.files).filter(f =>
                  f.type.startsWith('image/') || f.type === 'application/pdf'
                );
                if (validFiles.length < e.dataTransfer.files.length) {
                  setError('Hanya file gambar (JPG, PNG) dan PDF yang diizinkan');
                }
                setFiles(prev => [...prev, ...validFiles]);
              }
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" fontWeight={600}>
              Drag & drop file atau klik untuk pilih
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Format yang didukung: JPG, PNG, PDF (Maks. 5MB per file)
            </Typography>
            <input
              id="file-input"
              type="file"
              hidden
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </Box>

          {files.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                File yang akan diupload ({files.length}):
              </Typography>
              <Grid container spacing={2}>
                {files.map((file, i) => {
                  const isImage = file.type.startsWith('image/');
                  const isPdf = file.type === 'application/pdf';
                  const previewUrl = isImage ? URL.createObjectURL(file) : null;
                  return (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          position: 'relative',
                          '&:hover .delete-btn': { opacity: 1 },
                        }}
                      >
                        <Box
                          sx={{
                            height: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          {isImage && previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={file.name}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          ) : isPdf ? (
                            <PictureAsPdf sx={{ fontSize: 48, color: 'error.main' }} />
                          ) : (
                            <FilePresent sx={{ fontSize: 48, color: 'grey.400' }} />
                          )}
                        </Box>
                        <IconButton
                          className="delete-btn"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            opacity: 0.7,
                            '&:hover': { opacity: 1 },
                          }}
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" display="block" noWrap sx={{ mt: 1 }}>
                          {file.name}
                        </Typography>
                        <Chip
                          label={`${(file.size / 1024).toFixed(1)} KB`}
                          size="small"
                          sx={{ mt: 0.5, fontSize: '0.7rem' }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => setActiveStep(1)}>Kembali</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : 'Kirim Pengajuan'}
            </Button>
          </Box>
        </Paper>
      )}

      {activeStep === 3 && success && (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>Pengajuan Berhasil!</Typography>
          <Typography gutterBottom>Nomor Registrasi Anda:</Typography>
          <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
            {nomorRegistrasi}
          </Typography>

          {/* Important reminders */}
          <Alert severity="warning" sx={{ mb: 2, textAlign: 'left', borderRadius: 2 }} icon={<Warning />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              PENTING - LANGKAH SELANJUTNYA:
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                <ListItemText primary="Simpan nomor registrasi ini untuk tracking status" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                <ListItemText primary="DOKUMEN ASLI WAJIB dibawa ke kelurahan saat pengambilan" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><WhatsApp fontSize="small" color="success" /></ListItemIcon>
                <ListItemText primary="Staf akan menghubungi via WhatsApp jika ada kekurangan" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
          </Alert>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Pantau status pengajuan Anda di halaman Tracking dan tunggu konfirmasi dari staf kelurahan.
          </Typography>
          <Button variant="contained" onClick={() => {
            setActiveStep(0);
            setSuccess(false);
            setSelectedLayanan(null);
            setFormData({});
            setFiles([]);
          }}>
            Ajukan Layanan Lain
          </Button>
        </Paper>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              <Typography sx={{ fontSize: 28 }}>{detailLayanan?.icon}</Typography>
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>{detailLayanan?.nama_layanan}</Typography>
              <Typography variant="body2" color="text.secondary">{detailLayanan?.deskripsi}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Important Notice */}
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              INFORMASI PENTING:
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><CheckCircle fontSize="small" color="warning" /></ListItemIcon>
                <ListItemText primary="Dokumen asli WAJIB dibawa ke kantor kelurahan" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24 }}><WhatsApp fontSize="small" color="success" /></ListItemIcon>
                <ListItemText primary="Staf akan menghubungi via WhatsApp jika dokumen tidak lengkap" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
          </Alert>

          {/* Persyaratan Card */}
          <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description />
                <Typography variant="subtitle1" fontWeight={700}>
                  Dokumen Persyaratan yang Harus Disiapkan
                </Typography>
                <Chip
                  label={`${detailLayanan?.syarat?.length || 0} item`}
                  size="small"
                  sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700 }}
                />
              </Box>
            </Box>
            <Box sx={{ p: 2 }}>
              {detailLayanan?.syarat && detailLayanan.syarat.length > 0 ? (
                <List dense>
                  {detailLayanan.syarat.map((s, i) => (
                    <ListItem key={i} sx={{
                      bgcolor: i % 2 === 0 ? 'grey.50' : 'transparent',
                      borderRadius: 1,
                      mb: 0.5
                    }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main', fontSize: '0.75rem' }}>
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
              ) : (
                <Typography color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                  Tidak ada persyaratan khusus
                </Typography>
              )}
            </Box>
            <Box sx={{ bgcolor: 'error.light', p: 2, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
              <Typography variant="caption" fontWeight={700} color="error.dark">
                CATATAN: Dokumen asli wajib dibawa saat datang ke kelurahan untuk verifikasi dan pengambilan surat!
              </Typography>
            </Box>
          </Card>

          {/* Form Fields Info */}
          {detailLayanan?.fields && detailLayanan.fields.length > 0 && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Data yang Harus Diisi
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {detailLayanan.fields.map((f, i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                      <Chip
                        label={`${f.label}${f.required ? ' *' : ''}`}
                        size="small"
                        color={f.required ? 'primary' : 'default'}
                        variant={f.required ? 'filled' : 'outlined'}
                        sx={{ m: 0.25 }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  * Field wajib diisi
                </Typography>
              </Box>
            </Card>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDetailOpen(false)} startIcon={<Close />}>
            Tutup
          </Button>
          {detailLayanan && (
            <Button
              variant="contained"
              size="large"
              onClick={() => { setDetailOpen(false); handleSelectLayanan(detailLayanan); }}
              endIcon={<ArrowForward />}
            >
              Ajukan Sekarang
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
