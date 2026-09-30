'use client';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

const DEFAULT_ACCEPT = [
  'pdf',
  'doc',
  'docx',
  'txt',
  'md',
  'zip',
  'png',
  'jpg',
  'jpeg',
  'csv',
  'xlsx',
];

const buildAcceptMap = (extensions: string[]): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  extensions.forEach((ext) => {
    map['application/octet-stream'] = map['application/octet-stream'] ?? [];
    map['application/octet-stream'].push(`.${ext}`);
  });
  return map;
};

export interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string[];
  helperText?: string;
}

export const FileDropzone = ({
  onFiles,
  disabled = false,
  maxFiles = 5,
  maxSizeMb = 20,
  accept = DEFAULT_ACCEPT,
  helperText,
}: FileDropzoneProps) => {
  const [selected, setSelected] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setError(null);
      if (rejections.length > 0) {
        const first = rejections[0];
        const code = first?.errors[0]?.code;
        if (code === 'file-too-large') {
          setError(`File exceeds ${maxSizeMb} MB`);
        } else if (code === 'file-invalid-type') {
          setError('Unsupported file type');
        } else if (code === 'too-many-files') {
          setError(`Max ${maxFiles} files`);
        } else {
          setError('File rejected');
        }
        return;
      }
      const next = [...selected, ...accepted].slice(0, maxFiles);
      setSelected(next);
      onFiles(next);
    },
    [maxFiles, maxSizeMb, onFiles, selected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxFiles,
    maxSize: maxSizeMb * 1024 * 1024,
    accept: buildAcceptMap(accept),
  });

  const removeAt = (index: number) => {
    const next = selected.filter((_, i) => i !== index);
    setSelected(next);
    onFiles(next);
  };

  return (
    <Stack spacing={1.5}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="action" fontSize="large" />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {isDragActive
            ? 'Drop files here'
            : `Drag & drop or click to browse (max ${maxFiles} files, ${maxSizeMb} MB each)`}
        </Typography>
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {helperText}
          </Typography>
        )}
      </Box>

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}

      {selected.length > 0 && (
        <Stack spacing={0.5}>
          {selected.map((file, index) => (
            <Stack
              key={`${file.name}-${index}`}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'action.hover' }}
            >
              <Typography variant="body2" noWrap>
                {file.name}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  ({(file.size / 1024).toFixed(1)} KB)
                </Typography>
              </Typography>
              <IconButton size="small" onClick={() => removeAt(index)} disabled={disabled}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
