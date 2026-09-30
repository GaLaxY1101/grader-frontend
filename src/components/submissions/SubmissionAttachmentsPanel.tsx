'use client';

import { AttachmentList } from '@/components/common/AttachmentList';
import {
  getSubmissionAttachmentDownloadUrl,
  listSubmissionAttachments,
} from '@/lib/api/submissionAttachments';
import type { components } from '@/lib/api/types/index';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type AttachmentSummary = components['schemas']['AttachmentSummary'];

export interface SubmissionAttachmentsPanelProps {
  submissionId: number;
}

export const SubmissionAttachmentsPanel = ({ submissionId }: SubmissionAttachmentsPanelProps) => {
  const [attachments, setAttachments] = useState<AttachmentSummary[]>([]);

  useEffect(() => {
    listSubmissionAttachments(submissionId)
      .then(setAttachments)
      .catch(() => toast.error('Failed to load submission files'));
  }, [submissionId]);

  const handleDownload = async (attachment: AttachmentSummary) => {
    if (attachment.id == null) return;
    try {
      const url = await getSubmissionAttachmentDownloadUrl(submissionId, attachment.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Download link failed');
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        Submission files
      </Typography>
      <AttachmentList
        attachments={attachments}
        onDownload={handleDownload}
        emptyMessage="No files attached to this submission"
      />
    </Stack>
  );
};
