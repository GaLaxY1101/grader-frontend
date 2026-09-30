'use client';

import type { components } from '@/lib/api/types/index';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
} from '@mui/material';

type AttachmentSummary = components['schemas']['AttachmentSummary'];

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export interface AttachmentListProps {
  attachments: AttachmentSummary[];
  onDownload: (attachment: AttachmentSummary) => void;
  onDelete?: (attachment: AttachmentSummary) => void;
  emptyMessage?: string;
}

export const AttachmentList = ({
  attachments,
  onDownload,
  onDelete,
  emptyMessage = 'No files attached',
}: AttachmentListProps) => {
  if (attachments.length === 0) {
    return (
      <ListItemText
        primary={emptyMessage}
        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
      />
    );
  }

  return (
    <List dense disablePadding>
      {attachments.map((attachment) => (
        <ListItem key={attachment.id} disablePadding sx={{ pr: onDelete ? 12 : 6 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={attachment.filename}
            secondary={formatSize(attachment.sizeBytes ?? 0)}
            primaryTypographyProps={{ variant: 'body2' }}
          />
          <ListItemSecondaryAction>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => onDownload(attachment)}>
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(attachment)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};
