'use client';

import { AttachmentList } from '@/components/common/AttachmentList';
import { FileDropzone } from '@/components/common/FileDropzone';
import { SubmissionStateBanner } from '@/components/submissions/SubmissionStateBanner';
import {
  deleteSubmissionAttachment,
  getSubmissionAttachmentDownloadUrl,
  listSubmissionAttachments,
  turnInSubmission,
  uploadSubmissionAttachments,
} from '@/lib/api/submissionAttachments';
import type { SubmissionResponse } from '@/lib/api/submissions';
import type { components } from '@/lib/api/types/index';
import {
  SubmissionFileState,
  isFileStateEditable,
  isFileStateUploadAllowed,
} from '@/utils/assignmentType';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type AttachmentSummary = components['schemas']['AttachmentSummary'];

export interface StudentFileSubmissionPanelProps {
  assignmentId: number;
  initialSubmission: SubmissionResponse | null;
}

export const StudentFileSubmissionPanel = ({
  assignmentId,
  initialSubmission,
}: StudentFileSubmissionPanelProps) => {
  const [submission, setSubmission] = useState<SubmissionResponse | null>(initialSubmission);
  const [attachments, setAttachments] = useState<AttachmentSummary[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [turningIn, setTurningIn] = useState(false);

  const fileState = (submission?.fileState ?? null) as SubmissionFileState | null;
  const editable = isFileStateEditable(fileState) || submission == null;
  const canUpload = isFileStateUploadAllowed(fileState) || submission == null;

  useEffect(() => {
    if (submission?.id == null) return;
    void loadAttachments(submission.id);
  }, [submission?.id]);

  const loadAttachments = async (submissionId: number) => {
    try {
      setAttachments(await listSubmissionAttachments(submissionId));
    } catch {
      toast.error('Failed to load your files');
    }
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    try {
      const result = await uploadSubmissionAttachments(assignmentId, pendingFiles);
      const uploaded = result.upload?.uploaded ?? [];
      const failed = result.upload?.failed ?? [];
      if (failed.length > 0) {
        toast.warn(`${failed.length} file(s) rejected`);
      }
      if (uploaded.length > 0) {
        toast.success(`Uploaded ${uploaded.length} file(s)`);
      }
      setPendingFiles([]);
      const newSubmissionId = result.submissionId;
      if (newSubmissionId == null) return;
      if (submission == null || submission.id !== newSubmissionId) {
        setSubmission({
          id: newSubmissionId,
          assignmentId,
          fileState: SubmissionFileState.DRAFT,
        } as unknown as SubmissionResponse);
      }
      await loadAttachments(newSubmissionId);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachment: AttachmentSummary) => {
    if (submission?.id == null || attachment.id == null) return;
    try {
      await deleteSubmissionAttachment(submission.id, attachment.id);
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleDownload = async (attachment: AttachmentSummary) => {
    if (submission?.id == null || attachment.id == null) return;
    try {
      const url = await getSubmissionAttachmentDownloadUrl(submission.id, attachment.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Download link failed');
    }
  };

  const handleTurnIn = async () => {
    if (submission?.id == null) return;
    setTurningIn(true);
    try {
      const updated = await turnInSubmission(submission.id);
      setSubmission(updated as unknown as SubmissionResponse);
      toast.success('Turned in');
    } catch {
      toast.error('Turn in failed');
    } finally {
      setTurningIn(false);
    }
  };

  return (
    <Stack spacing={2}>
      {fileState != null && (
        <SubmissionStateBanner
          fileState={fileState}
          returnComment={submission?.returnComment}
          canTurnIn={attachments.length > 0}
          onTurnIn={handleTurnIn}
          turningIn={turningIn}
        />
      )}

      <Box>
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          Your files
        </Typography>
        <AttachmentList
          attachments={attachments}
          onDownload={handleDownload}
          onDelete={editable ? handleDelete : undefined}
          emptyMessage="You have not attached any files yet"
        />
      </Box>

      {canUpload && (
        <>
          <Divider />
          <FileDropzone onFiles={setPendingFiles} disabled={uploading} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={pendingFiles.length === 0 || uploading}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </Box>
        </>
      )}
    </Stack>
  );
};
