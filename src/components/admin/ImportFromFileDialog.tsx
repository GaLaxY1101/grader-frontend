'use client';

import { parseStudentsFile, type BulkImportProblem } from '@/lib/api/bulkImport';
import type { components } from '@/lib/api/types/index';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

type ParsedStudentRow = components['schemas']['ParsedStudentRow'];

export type MergeMode = 'append' | 'replace';

export interface ImportFromFileResult {
  rows: ParsedStudentRow[];
  mergeMode: MergeMode;
}

interface ImportFromFileDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: (result: ImportFromFileResult) => void;
  currentRowCount: number;
}

const DEFAULT_MAPPING = {
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
};

const isBulkImportProblem = (value: unknown): value is BulkImportProblem => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.status === 'number' && typeof v.title === 'string';
};

export const ImportFromFileDialog = ({
  open,
  onClose,
  onImported,
  currentRowCount,
}: ImportFromFileDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState(DEFAULT_MAPPING);
  const [mergeMode, setMergeMode] = useState<MergeMode>(
    currentRowCount === 0 ? 'replace' : 'append',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingColumn, setMissingColumn] = useState<string | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[] | null>(null);

  const canSubmit = useMemo(
    () =>
      file != null &&
      mapping.email.trim().length > 0 &&
      mapping.firstName.trim().length > 0 &&
      mapping.lastName.trim().length > 0,
    [file, mapping],
  );

  const reset = () => {
    setFile(null);
    setMapping(DEFAULT_MAPPING);
    setError(null);
    setMissingColumn(null);
    setDetectedHeaders(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleImport = async () => {
    if (file == null) return;
    setSubmitting(true);
    setError(null);
    setMissingColumn(null);
    setDetectedHeaders(null);
    try {
      const parsed = await parseStudentsFile(file, {
        email: mapping.email.trim(),
        firstName: mapping.firstName.trim(),
        lastName: mapping.lastName.trim(),
        phone: mapping.phone.trim() === '' ? undefined : mapping.phone.trim(),
      });
      onImported({ rows: parsed.rows ?? [], mergeMode });
      reset();
      onClose();
    } catch (err: unknown) {
      if (isBulkImportProblem(err)) {
        setError(err.detail);
        if (typeof err.missingColumn === 'string') setMissingColumn(err.missingColumn);
        if (Array.isArray(err.detectedHeaders)) setDetectedHeaders(err.detectedHeaders);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to import file');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import students from Excel</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 1.5, borderStyle: 'dashed' }}
            >
              {file != null ? file.name : 'Choose .xlsx file'}
              <input
                type="file"
                hidden
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setError(null);
                  setMissingColumn(null);
                  setDetectedHeaders(null);
                }}
              />
            </Button>
            {file != null && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Column mapping
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Which header in your file corresponds to each field? Matching is case-insensitive and
              whitespace is trimmed. Leave the phone field blank to skip the phone column.
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                label="Column for email"
                required
                value={mapping.email}
                onChange={(e) => setMapping((m) => ({ ...m, email: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Column for first name"
                required
                value={mapping.firstName}
                onChange={(e) => setMapping((m) => ({ ...m, firstName: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Column for last name"
                required
                value={mapping.lastName}
                onChange={(e) => setMapping((m) => ({ ...m, lastName: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Column for phone (optional)"
                value={mapping.phone}
                onChange={(e) => setMapping((m) => ({ ...m, phone: e.target.value }))}
                size="small"
                fullWidth
                placeholder="Leave blank to skip"
              />
            </Stack>
          </Box>

          {currentRowCount > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Merge mode
              </Typography>
              <RadioGroup value={mergeMode} onChange={(_, v) => setMergeMode(v as MergeMode)}>
                <FormControlLabel
                  value="append"
                  control={<Radio size="small" />}
                  label={`Append to current ${currentRowCount} row(s)`}
                />
                <FormControlLabel
                  value="replace"
                  control={<Radio size="small" />}
                  label="Replace current rows"
                />
              </RadioGroup>
            </Box>
          )}

          {error != null && (
            <Alert severity="error">
              <AlertTitle>Could not import file</AlertTitle>
              {error}
              {missingColumn != null && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Missing column: <strong>{missingColumn}</strong>
                </Typography>
              )}
              {detectedHeaders != null && detectedHeaders.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Headers found in your file — click to use one:
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {detectedHeaders.map((h) => (
                      <Chip
                        key={h}
                        label={h}
                        size="small"
                        onClick={() => {
                          if (missingColumn == null) return;
                          setMapping((m) => {
                            const key = Object.entries(m).find(
                              ([, value]) => value === missingColumn,
                            )?.[0] as keyof typeof m | undefined;
                            if (key == null) return m;
                            return { ...m, [key]: h };
                          });
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <LoadingButton
          onClick={handleImport}
          variant="contained"
          disabled={!canSubmit}
          loading={submitting}
        >
          Parse file
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
