'use client';

import { AttachmentList } from '@/components/common/AttachmentList';
import { FileDropzone } from '@/components/common/FileDropzone';
import {
  deleteTemplateAssignmentAttachment,
  getTemplateAssignmentAttachmentDownloadUrl,
  listTemplateAssignmentAttachments,
  uploadTemplateAssignmentAttachments,
} from '@/lib/api/templateAssignmentAttachments';
import type { components } from '@/lib/api/types/index';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type AttachmentSummary = components['schemas']['AttachmentSummary'];

export interface TemplateAssignmentAttachmentsPanelProps {
  templateAssignmentId: number;
  canEdit: boolean;
}

export const TemplateAssignmentAttachmentsPanel = ({
  templateAssignmentId,
  canEdit,
}: TemplateAssignmentAttachmentsPanelProps) => {
  const [attachments, setAttachments] = useState<AttachmentSummary[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateAssignmentId]);

  const refresh = async () => {
    try {
      setAttachments(await listTemplateAssignmentAttachments(templateAssignmentId));
    } catch {
      toast.error('Failed to refresh attachments');
    }
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    try {
      const result = await uploadTemplateAssignmentAttachments(templateAssignmentId, pendingFiles);
      const uploaded = result.uploaded ?? [];
      const failed = result.failed ?? [];
      if (failed.length > 0) toast.warn(`${failed.length} file(s) rejected`);
      if (uploaded.length > 0) toast.success(`Uploaded ${uploaded.length} file(s)`);
      setPendingFiles([]);
      await refresh();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachment: AttachmentSummary) => {
    if (attachment.id == null) return;
    try {
      await deleteTemplateAssignmentAttachment(templateAssignmentId, attachment.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleDownload = async (attachment: AttachmentSummary) => {
    if (attachment.id == null) return;
    try {
      const url = await getTemplateAssignmentAttachmentDownloadUrl(
        templateAssignmentId,
        attachment.id,
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Download link failed');
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        Template files
      </Typography>
      <AttachmentList
        attachments={attachments}
        onDownload={handleDownload}
        onDelete={canEdit ? handleDelete : undefined}
        emptyMessage="No files attached to this template assignment"
      />
      {canEdit && (
        <>
          <Divider />
          <Box>
            <FileDropzone onFiles={setPendingFiles} disabled={uploading} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={pendingFiles.length === 0 || uploading}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Stack>
  );
};
