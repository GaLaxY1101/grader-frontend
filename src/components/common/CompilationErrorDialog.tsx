'use client';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Portal from '@mui/material/Portal';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface CompilationErrorDialogProps {
  open: boolean;
  output: string | null;
  onClose: () => void;
}

export const CompilationErrorDialog = ({ open, output, onClose }: CompilationErrorDialogProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    const text = output ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (!open) return null;

  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(900px, calc(100vw - 48px))',
          zIndex: (theme) => theme.zIndex.modal + 200,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderTop: '4px solid',
            borderColor: 'error.main',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ErrorOutlineIcon color="error" />
            <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
              Compilation failed
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color={copied ? 'success' : 'inherit'}
              startIcon={
                copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />
              }
              onClick={handleCopy}
              disabled={!output}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <IconButton size="small" onClick={onClose} aria-label="Close">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Fix the errors below and try again.
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                bgcolor: 'grey.900',
                color: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              {output ?? 'Unknown compilation error'}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Portal>
  );
};
