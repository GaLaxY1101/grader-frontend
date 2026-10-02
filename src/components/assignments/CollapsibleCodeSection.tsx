'use client';

import type { EditorProps } from '@monaco-editor/react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';

/** Monaco options shared by every code editor in the assignment form. */
export const codeEditorOptions: EditorProps['options'] = {
  minimap: { enabled: false },
  fontSize: 13,
  tabSize: 4,
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  padding: { top: 12, bottom: 12 },
  scrollbar: { alwaysConsumeMouseWheel: false },
};

interface EditorFrameProps {
  hasError?: boolean;
  children: ReactNode;
}

/** Bordered box around a Monaco editor; turns red when the field has an error. */
export const EditorFrame = ({ hasError = false, children }: EditorFrameProps) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: hasError ? 'error.main' : 'divider',
      borderRadius: 1,
      overflow: 'hidden',
    }}
  >
    {children}
  </Box>
);

interface CollapsibleCodeSectionProps {
  title: string;
  caption: ReactNode;
  errorMessage?: string;
  defaultOpen?: boolean;
  /** Rendered between the header and the collapsible body (e.g. hidden file inputs). */
  header?: ReactNode;
  children: ReactNode;
}

/**
 * Outlined section with a clickable header that expands/collapses its body.
 * Used for the code editors of the assignment form.
 */
export const CollapsibleCodeSection = ({
  title,
  caption,
  errorMessage,
  defaultOpen = true,
  header,
  children,
}: CollapsibleCodeSectionProps) => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const toggle = () => setOpen((v) => !v);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: errorMessage ? 'error.main' : 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={open}
        aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
        sx={{
          display: 'block',
          width: '100%',
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: 1,
          mx: -1,
          px: 1,
          py: 0.5,
          mb: 1,
          '&:hover': { bgcolor: 'action.hover' },
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          <Typography variant="subtitle2">{title}</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {caption}
        </Typography>
      </Box>
      {header}
      <Collapse in={open} unmountOnExit={false}>
        {children}
      </Collapse>
      {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
    </Paper>
  );
};
