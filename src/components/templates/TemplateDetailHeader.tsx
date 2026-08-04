'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { EditTemplateDialog } from './EditTemplateDialog';
import { ShareTemplateDialog } from './ShareTemplateDialog';

type CourseTemplateDetailResponse = components['schemas']['CourseTemplateDetailResponse'];

interface TemplateDetailHeaderProps {
  template: CourseTemplateDetailResponse;
  isOwner: boolean;
  canEdit: boolean;
}

export const TemplateDetailHeader = ({ template, isOwner, canEdit }: TemplateDetailHeaderProps) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const templateId = template.id;

  const handleCopy = async () => {
    if (templateId == null) return;
    const { data, error } = await apiClient.POST('/api/templates/{id}/copy', {
      params: { path: { id: templateId } },
    });
    if (error || data?.id == null) {
      toast.error('Failed to copy template');
      return;
    }
    toast.success('Template copied');
    router.push(`/templates/${data.id}`);
  };

  const handleDelete = async () => {
    if (templateId == null) return;
    if (!window.confirm(`Delete template "${template.name}"? This cannot be undone.`)) return;
    const { error } = await apiClient.DELETE('/api/templates/{id}', {
      params: { path: { id: templateId } },
    });
    if (error) {
      toast.error('Failed to delete template');
      return;
    }
    toast.success('Template deleted');
    router.push('/templates');
  };

  const handleEditClick = () => {
    if (canEdit) {
      setEditOpen(true);
      return;
    }
    const confirmed = window.confirm(
      `This template is owned by ${template.ownerFullName ?? 'someone else'}. ` +
        `You can copy it and edit your own version. Copy now?`,
    );
    if (confirmed) handleCopy();
  };

  return (
    <>
      <Card>
        <CardContent sx={{ py: 1.5, px: 3, '&:last-child': { pb: 1.5 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            size="small"
            onClick={() => router.push('/templates')}
          >
            Back to templates
          </Button>
        </CardContent>
        <Divider />
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip
                  label={isOwner ? 'Owned' : 'Shared with you'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '5px',
                    backgroundColor: isOwner ? '#DBEAFE' : '#FEF3C7',
                    color: isOwner ? '#1E40AF' : '#92400E',
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
                {template.name ?? '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Owner: {template.ownerFullName ?? '—'}
              </Typography>
              {template.description != null && (
                <Typography variant="body1" sx={{ mt: 1.5 }}>
                  {template.description}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditClick}>
                Edit
              </Button>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                Copy
              </Button>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareOpen(true)}
                >
                  Share
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {templateId != null && (
        <>
          <EditTemplateDialog
            template={template}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />
          <ShareTemplateDialog
            templateId={templateId}
            open={shareOpen}
            onClose={() => setShareOpen(false)}
          />
        </>
      )}
    </>
  );
};
