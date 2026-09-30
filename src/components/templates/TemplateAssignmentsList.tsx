'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import { supportsFiles } from '@/utils/assignmentType';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CreateTemplateAssignmentDialog } from './CreateTemplateAssignmentDialog';
import { EditTemplateAssignmentDialog } from './EditTemplateAssignmentDialog';
import { TemplateAssignmentAttachmentsPanel } from './TemplateAssignmentAttachmentsPanel';

type TemplateAssignmentResponse = components['schemas']['TemplateAssignmentResponse'];

interface TemplateAssignmentsListProps {
  templateId: number;
  assignments: TemplateAssignmentResponse[];
  canEdit: boolean;
}

export const TemplateAssignmentsList = ({
  templateId,
  assignments,
  canEdit,
}: TemplateAssignmentsListProps) => {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateAssignmentResponse | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete assignment "${title}"?`)) return;
    const { error } = await apiClient.DELETE('/api/template-assignments/{id}', {
      params: { path: { id } },
    });
    if (error) {
      toast.error('Failed to delete assignment');
      return;
    }
    toast.success('Assignment deleted');
    router.refresh();
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Card>
        <CardContent
          sx={{
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:last-child': { pb: 2 },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Assignments ({assignments.length})
          </Typography>
          {canEdit && (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Add Assignment
            </Button>
          )}
        </CardContent>
        <Divider />
        {assignments.length === 0 ? (
          <CardContent sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {canEdit
                ? 'No assignments yet. Click "Add Assignment" to start.'
                : 'This template has no assignments yet.'}
            </Typography>
          </CardContent>
        ) : (
          <Stack divider={<Divider />}>
            {assignments.map((a) => {
              const filesEnabled = supportsFiles(a.type);
              const showAttachments = filesEnabled && a.id != null;
              const isOpen = a.id != null && !!expanded[a.id];
              return (
                <Box key={a.id}>
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {a.title ?? '—'}
                        </Typography>
                        {a.type != null && a.type !== 'CODE' && (
                          <Chip
                            label={a.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', borderRadius: '5px' }}
                          />
                        )}
                        {a.programmingTask != null && (
                          <Tooltip title="Code check enabled">
                            <Chip
                              icon={<CodeIcon sx={{ fontSize: 14 }} />}
                              label={a.programmingTask.language ?? ''}
                              size="small"
                              sx={{ fontSize: '0.7rem', fontWeight: 600, borderRadius: '5px' }}
                            />
                          </Tooltip>
                        )}
                        <Chip
                          label={`${a.maxScore ?? 0} pts`}
                          size="small"
                          sx={{ fontSize: '0.7rem', borderRadius: '5px' }}
                        />
                        {(a.attachmentCount ?? 0) > 0 && (
                          <Chip
                            label={`${a.attachmentCount} file${a.attachmentCount === 1 ? '' : 's'}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', borderRadius: '5px' }}
                          />
                        )}
                      </Stack>
                      {a.description != null && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {a.description}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      {showAttachments && (
                        <Tooltip title={isOpen ? 'Hide files' : 'Show files'}>
                          <IconButton
                            size="small"
                            onClick={() => a.id != null && toggleExpand(a.id)}
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                            sx={{
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 200ms',
                            }}
                          >
                            <ExpandMoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canEdit && (
                        <>
                          <IconButton size="small" onClick={() => setEditing(a)} aria-label="Edit">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => a.id != null && handleDelete(a.id, a.title ?? '')}
                            aria-label="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </Box>
                  {showAttachments && (
                    <Collapse in={isOpen} unmountOnExit>
                      <Box sx={{ px: 3, pb: 2 }}>
                        <TemplateAssignmentAttachmentsPanel
                          templateAssignmentId={a.id!}
                          canEdit={canEdit}
                        />
                      </Box>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>

      <CreateTemplateAssignmentDialog
        templateId={templateId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editing != null && (
        <EditTemplateAssignmentDialog
          assignment={editing}
          open={editing != null}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
};
