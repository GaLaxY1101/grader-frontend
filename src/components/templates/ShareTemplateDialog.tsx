'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type TeacherResponse = components['schemas']['TeacherResponse'];
type TemplateShareResponse = components['schemas']['TemplateShareResponse'];

interface ShareTemplateDialogProps {
  templateId: number;
  open: boolean;
  onClose: () => void;
}

export const ShareTemplateDialog = ({ templateId, open, onClose }: ShareTemplateDialogProps) => {
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [shares, setShares] = useState<TemplateShareResponse[]>([]);
  const [selected, setSelected] = useState<TeacherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      apiClient.GET('/api/v1/teachers'),
      apiClient.GET('/api/templates/{templateId}/shares', {
        params: { path: { templateId } },
      }),
    ])
      .then(([teacherRes, sharesRes]) => {
        if (teacherRes.error) toast.error('Failed to load teachers');
        else setTeachers(teacherRes.data ?? []);
        if (sharesRes.error) toast.error('Failed to load shares');
        else setShares(sharesRes.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [open, templateId]);

  const sharedTeacherIds = useMemo(
    () => new Set(shares.map((s) => s.teacherId).filter((id): id is number => id != null)),
    [shares],
  );

  const availableTeachers = useMemo(
    () => teachers.filter((t) => t.id != null && !sharedTeacherIds.has(t.id)),
    [teachers, sharedTeacherIds],
  );

  const handleAdd = async () => {
    if (selected?.id == null) return;
    setSubmitting(true);
    const { data, error } = await apiClient.POST('/api/templates/{templateId}/shares', {
      params: { path: { templateId } },
      body: { teacherId: selected.id },
    });
    setSubmitting(false);
    if (error || !data) {
      toast.error('Failed to share template');
      return;
    }
    setShares((prev) => [...prev, data]);
    setSelected(null);
  };

  const handleRemove = async (teacherId: number) => {
    const { error } = await apiClient.DELETE('/api/templates/{templateId}/shares/{teacherId}', {
      params: { path: { templateId, teacherId } },
    });
    if (error) {
      toast.error('Failed to revoke share');
      return;
    }
    setShares((prev) => prev.filter((s) => s.teacherId !== teacherId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Template</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Shared teachers can view and copy this template. Only the owner can edit it.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={availableTeachers}
              loading={loading}
              value={selected}
              onChange={(_, v) => setSelected(v)}
              getOptionLabel={(o) =>
                `${o.firstName ?? ''} ${o.lastName ?? ''} (${o.email ?? ''})`.trim()
              }
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Teacher"
                  placeholder="Pick a teacher"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && <CircularProgress color="inherit" size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <LoadingButton
              variant="contained"
              onClick={handleAdd}
              disabled={selected == null}
              loading={submitting}
            >
              Add
            </LoadingButton>
          </Box>

          <Divider />

          <Typography variant="subtitle2">Currently shared with</Typography>
          {shares.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Not shared with anyone yet.
            </Typography>
          ) : (
            <List dense>
              {shares.map((share) => (
                <ListItem
                  key={share.id}
                  secondaryAction={
                    share.teacherId != null && (
                      <IconButton edge="end" onClick={() => handleRemove(share.teacherId!)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={share.teacherFullName ?? '—'}
                    secondary={share.teacherEmail ?? undefined}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
