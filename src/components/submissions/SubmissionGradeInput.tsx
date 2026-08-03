'use client';

import { apiClient } from '@/lib/api/client';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface SubmissionGradeInputProps {
  submissionId: number;
  initialGrade: number | null;
  maxScore: number | null;
}

type SaveState = 'idle' | 'pending' | 'saved' | 'error';

export const SubmissionGradeInput = ({
  submissionId,
  initialGrade,
  maxScore,
}: SubmissionGradeInputProps) => {
  const [value, setValue] = useState<string>(initialGrade == null ? '' : String(initialGrade));
  const [state, setState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    },
    [],
  );

  const save = async (raw: string) => {
    const trimmed = raw.trim();
    const parsed = trimmed === '' ? null : Number(trimmed);
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) {
      setState('error');
      toast.error('Grade must be a non-negative integer');
      return;
    }
    if (parsed !== null && maxScore != null && parsed > maxScore) {
      setState('error');
      toast.error(`Grade cannot exceed ${maxScore}`);
      return;
    }

    setState('pending');
    const { error } = await apiClient.PATCH('/api/submissions/{id}/grade', {
      params: { path: { id: submissionId } },
      body: { grade: parsed ?? undefined },
    });
    if (error) {
      setState('error');
      toast.error('Failed to save grade');
      return;
    }
    setState('saved');
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setState('idle'), 1500);
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void save(next), 500);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <TextField
        size="small"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder="—"
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
          style: { width: 44, textAlign: 'center', padding: '4px 6px' },
        }}
        error={state === 'error'}
        sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24 }}>
        /{maxScore ?? '?'}
      </Typography>
      {state === 'pending' && <CircularProgress size={14} />}
      {state === 'saved' && <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />}
    </Box>
  );
};
