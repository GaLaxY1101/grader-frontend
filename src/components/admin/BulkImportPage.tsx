'use client';

import { PageHeader } from '@/components/common/PageHeader';
import {
  commitBulkImportIntoGroup,
  commitBulkImportWithNewGroup,
  type BulkImportProblem,
} from '@/lib/api/bulkImport';
import type { components } from '@/lib/api/types/index';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ImportFromFileDialog, type ImportFromFileResult } from './ImportFromFileDialog';

type GroupResponse = components['schemas']['GroupResponse'];
type ParsedStudentRow = components['schemas']['ParsedStudentRow'];
type StudentInput = components['schemas']['StudentInput'];

interface BulkImportPageProps {
  groups: GroupResponse[];
  existingEmails: string[];
}

interface EditableRow {
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  serverErrors: string[];
}

type GroupMode = 'new' | 'existing';

interface NewGroupForm {
  code: string;
  faculty: string;
  speciality: string;
  yearOfCreation: number;
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let rowIdCounter = 0;
const nextRowId = () => {
  rowIdCounter += 1;
  return `row-${rowIdCounter}`;
};

const emptyRow = (): EditableRow => ({
  clientId: nextRowId(),
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  serverErrors: [],
});

const parsedToEditable = (parsed: ParsedStudentRow): EditableRow => ({
  clientId: nextRowId(),
  email: parsed.email ?? '',
  firstName: parsed.firstName ?? '',
  lastName: parsed.lastName ?? '',
  phone: parsed.phone ?? '',
  serverErrors: parsed.errors ?? [],
});

interface RowValidation {
  emailError: string | null;
  firstNameError: string | null;
  lastNameError: string | null;
  isEmpty: boolean;
  isValid: boolean;
}

const validateRow = (
  row: EditableRow,
  duplicateInBatch: boolean,
  existsInDb: boolean,
): RowValidation => {
  const email = row.email.trim();
  const firstName = row.firstName.trim();
  const lastName = row.lastName.trim();
  const isEmpty = email === '' && firstName === '' && lastName === '' && row.phone.trim() === '';

  let emailError: string | null = null;
  if (!isEmpty) {
    if (email === '') emailError = 'Required';
    else if (!EMAIL_RX.test(email)) emailError = 'Invalid email format';
    else if (duplicateInBatch) emailError = 'Duplicate email in batch';
    else if (existsInDb) emailError = 'Already registered — remove this row';
  }
  const firstNameError = !isEmpty && firstName === '' ? 'Required' : null;
  const lastNameError = !isEmpty && lastName === '' ? 'Required' : null;

  return {
    emailError,
    firstNameError,
    lastNameError,
    isEmpty,
    isValid:
      !isEmpty &&
      emailError === null &&
      firstNameError === null &&
      lastNameError === null &&
      row.serverErrors.length === 0,
  };
};

const isBulkImportProblem = (value: unknown): value is BulkImportProblem => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.status === 'number' && typeof v.title === 'string';
};

export const BulkImportPage = ({ groups, existingEmails }: BulkImportPageProps) => {
  const router = useRouter();

  const [rows, setRows] = useState<EditableRow[]>([emptyRow()]);
  const [groupMode, setGroupMode] = useState<GroupMode>('new');
  const [newGroup, setNewGroup] = useState<NewGroupForm>({
    code: '',
    faculty: '',
    speciality: '',
    yearOfCreation: new Date().getFullYear(),
  });
  const [existingGroupId, setExistingGroupId] = useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batchBannerError, setBatchBannerError] = useState<string | null>(null);

  const duplicateEmails = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const row of rows) {
      const email = row.email.trim().toLowerCase();
      if (email === '') continue;
      if (seen.has(email)) duplicates.add(email);
      else seen.add(email);
    }
    return duplicates;
  }, [rows]);

  const existingEmailSet = useMemo(
    () => new Set(existingEmails.map((e) => e.trim().toLowerCase())),
    [existingEmails],
  );

  const validations = useMemo(
    () =>
      rows.map((row) => {
        const key = row.email.trim().toLowerCase();
        return validateRow(row, duplicateEmails.has(key), key !== '' && existingEmailSet.has(key));
      }),
    [rows, duplicateEmails, existingEmailSet],
  );

  const validCount = validations.filter((v) => v.isValid).length;
  const errorCount = validations.filter((v) => !v.isEmpty && !v.isValid).length;
  const populatedRowIndices = validations.map((v, i) => (v.isEmpty ? -1 : i)).filter((i) => i >= 0);

  const groupIsValid =
    groupMode === 'existing'
      ? existingGroupId !== ''
      : newGroup.code.trim() !== '' &&
        Number.isFinite(newGroup.yearOfCreation) &&
        newGroup.yearOfCreation >= 2000;

  const canSubmit =
    !submitting && populatedRowIndices.length > 0 && errorCount === 0 && groupIsValid;

  const updateRow = (clientId: string, patch: Partial<EditableRow>) => {
    setRows((prev) =>
      prev.map((r) =>
        r.clientId === clientId ? { ...r, ...patch, serverErrors: patch.serverErrors ?? [] } : r,
      ),
    );
    setBatchBannerError(null);
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const deleteRow = (clientId: string) =>
    setRows((prev) => {
      const filtered = prev.filter((r) => r.clientId !== clientId);
      return filtered.length === 0 ? [emptyRow()] : filtered;
    });

  const clearAll = () => {
    setRows([emptyRow()]);
    setBatchBannerError(null);
  };

  const handleImported = ({ rows: parsedRows, mergeMode }: ImportFromFileResult) => {
    const mapped = parsedRows.map(parsedToEditable);
    if (mergeMode === 'replace') {
      setRows(mapped.length === 0 ? [emptyRow()] : mapped);
    } else {
      const existing = rows.filter(
        (r) =>
          !validateRow(r, false, false).isEmpty ||
          r.email.trim() !== '' ||
          r.firstName.trim() !== '' ||
          r.lastName.trim() !== '' ||
          r.phone.trim() !== '',
      );
      const merged = [...existing, ...mapped];
      setRows(merged.length === 0 ? [emptyRow()] : merged);
    }
    setBatchBannerError(null);
    toast.success(`Imported ${parsedRows.length} row(s) from file`);
  };

  const applyServerRowErrors = (errors: NonNullable<BulkImportProblem['errors']>) => {
    const messagesByPopulatedIndex = new Map<number, string[]>();
    for (const err of errors) {
      const populatedIndex = err.rowNumber - 1;
      const list = messagesByPopulatedIndex.get(populatedIndex) ?? [];
      list.push(err.field != null ? `${err.field}: ${err.message}` : err.message);
      messagesByPopulatedIndex.set(populatedIndex, list);
    }
    setRows((prev) =>
      prev.map((row) => {
        const populatedIndex = populatedRowIndices.indexOf(prev.indexOf(row));
        const messages = messagesByPopulatedIndex.get(populatedIndex);
        return messages != null ? { ...row, serverErrors: messages } : row;
      }),
    );
  };

  const buildPayloadStudents = (): StudentInput[] =>
    populatedRowIndices
      .map((i) => rows[i])
      .filter((r): r is EditableRow => r != null)
      .map((r) => ({
        email: r.email.trim(),
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        phone: r.phone.trim() === '' ? undefined : r.phone.trim(),
      }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setBatchBannerError(null);
    try {
      const students = buildPayloadStudents();
      const result =
        groupMode === 'new'
          ? await commitBulkImportWithNewGroup({
              group: {
                code: newGroup.code.trim(),
                faculty: newGroup.faculty.trim() || undefined,
                speciality: newGroup.speciality.trim() || undefined,
                yearOfCreation: newGroup.yearOfCreation,
              },
              students,
            })
          : await commitBulkImportIntoGroup(Number(existingGroupId), { students });

      const created = result.created?.length ?? 0;
      const linked = result.linked?.length ?? 0;
      toast.success(`Imported ${created + linked} students (${created} new, ${linked} linked)`);
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      if (isBulkImportProblem(err)) {
        setBatchBannerError(err.detail);
        if (Array.isArray(err.errors) && err.errors.length > 0) {
          applyServerRowErrors(err.errors);
        }
      } else if (err instanceof Error) {
        setBatchBannerError(err.message);
      } else {
        setBatchBannerError('Failed to import students');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 12 }}>
      <PageHeader
        title="Bulk import students"
        subtitle="Add students one at a time, or upload an Excel file — then review, edit, and create them all at once."
      />

      {batchBannerError != null && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setBatchBannerError(null)}>
          <AlertTitle>Could not create students</AlertTitle>
          {batchBannerError}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Target group
          </Typography>
          <RadioGroup
            row
            value={groupMode}
            onChange={(_, v) => setGroupMode(v as GroupMode)}
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 3,
                px: 2,
                py: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: groupMode === 'new' ? 'primary.main' : 'divider',
                bgcolor: groupMode === 'new' ? 'action.hover' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setGroupMode('new')}
            >
              <Radio checked={groupMode === 'new'} size="small" />
              <Typography variant="body2">Create new group</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: groupMode === 'existing' ? 'primary.main' : 'divider',
                bgcolor: groupMode === 'existing' ? 'action.hover' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setGroupMode('existing')}
            >
              <Radio checked={groupMode === 'existing'} size="small" />
              <Typography variant="body2">Add to existing group</Typography>
            </Box>
          </RadioGroup>

          {groupMode === 'new' ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Group code"
                required
                value={newGroup.code}
                onChange={(e) => setNewGroup((g) => ({ ...g, code: e.target.value }))}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Faculty"
                value={newGroup.faculty}
                onChange={(e) => setNewGroup((g) => ({ ...g, faculty: e.target.value }))}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Speciality"
                value={newGroup.speciality}
                onChange={(e) => setNewGroup((g) => ({ ...g, speciality: e.target.value }))}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Year"
                type="number"
                required
                value={newGroup.yearOfCreation}
                onChange={(e) =>
                  setNewGroup((g) => ({ ...g, yearOfCreation: Number(e.target.value) }))
                }
                size="small"
                sx={{ width: { xs: '100%', sm: 120 } }}
              />
            </Stack>
          ) : (
            <TextField
              select
              label="Existing group"
              value={existingGroupId}
              onChange={(e) => setExistingGroupId(e.target.value)}
              size="small"
              fullWidth
              required
              helperText={groups.length === 0 ? 'No groups exist yet' : ''}
            >
              {groups
                .filter((g) => g.isActive)
                .map((g) => (
                  <MenuItem key={g.id} value={String(g.id)}>
                    {g.code} {g.faculty ? `— ${g.faculty}` : ''}
                  </MenuItem>
                ))}
            </TextField>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2, flexWrap: 'wrap' }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Students
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import from Excel
              </Button>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addRow}>
                Add row
              </Button>
              <Button
                variant="text"
                color="inherit"
                startIcon={<PlaylistRemoveIcon />}
                onClick={clearAll}
                disabled={rows.length === 1 && validations[0]?.isEmpty}
              >
                Clear all
              </Button>
            </Stack>
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 40 }}>#</TableCell>
                  <TableCell>Email *</TableCell>
                  <TableCell>First name *</TableCell>
                  <TableCell>Last name *</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell sx={{ width: 100 }}>Status</TableCell>
                  <TableCell align="right" sx={{ width: 60 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => {
                  const v = validations[i];
                  if (v == null) return null;
                  return (
                    <TableRow key={row.clientId} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <TextField
                          value={row.email}
                          onChange={(e) => updateRow(row.clientId, { email: e.target.value })}
                          size="small"
                          variant="standard"
                          error={v.emailError != null}
                          helperText={v.emailError}
                          fullWidth
                          placeholder="alice@example.com"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.firstName}
                          onChange={(e) => updateRow(row.clientId, { firstName: e.target.value })}
                          size="small"
                          variant="standard"
                          error={v.firstNameError != null}
                          helperText={v.firstNameError}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.lastName}
                          onChange={(e) => updateRow(row.clientId, { lastName: e.target.value })}
                          size="small"
                          variant="standard"
                          error={v.lastNameError != null}
                          helperText={v.lastNameError}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.phone}
                          onChange={(e) => updateRow(row.clientId, { phone: e.target.value })}
                          size="small"
                          variant="standard"
                          fullWidth
                          placeholder="+380..."
                        />
                      </TableCell>
                      <TableCell>
                        {v.isEmpty ? (
                          <Chip label="Empty" size="small" variant="outlined" />
                        ) : v.isValid ? (
                          <Chip
                            label="Valid"
                            size="small"
                            color="success"
                            icon={<CheckCircleIcon />}
                          />
                        ) : (
                          <Tooltip
                            title={
                              <Box>
                                {row.serverErrors.length > 0 && (
                                  <>
                                    <Typography variant="caption" display="block">
                                      Server:
                                    </Typography>
                                    {row.serverErrors.map((m, idx) => (
                                      <Typography key={idx} variant="caption" display="block">
                                        • {m}
                                      </Typography>
                                    ))}
                                  </>
                                )}
                                {v.emailError && (
                                  <Typography variant="caption" display="block">
                                    • email: {v.emailError}
                                  </Typography>
                                )}
                                {v.firstNameError && (
                                  <Typography variant="caption" display="block">
                                    • firstName: {v.firstNameError}
                                  </Typography>
                                )}
                                {v.lastNameError && (
                                  <Typography variant="caption" display="block">
                                    • lastName: {v.lastNameError}
                                  </Typography>
                                )}
                              </Box>
                            }
                          >
                            <Chip
                              label="Error"
                              size="small"
                              color="error"
                              icon={<ErrorOutlineIcon />}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => deleteRow(row.clientId)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 2 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={`${populatedRowIndices.length} row${populatedRowIndices.length === 1 ? '' : 's'}`}
                size="small"
              />
              <Chip label={`${validCount} valid`} size="small" color="success" variant="outlined" />
              {errorCount > 0 && (
                <Chip
                  label={`${errorCount} with errors`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="text" onClick={() => router.push('/admin')} disabled={submitting}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                disabled={!canSubmit}
                loading={submitting}
              >
                Create {populatedRowIndices.length} student
                {populatedRowIndices.length === 1 ? '' : 's'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      <ImportFromFileDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImported={handleImported}
        currentRowCount={populatedRowIndices.length}
      />
    </Container>
  );
};
