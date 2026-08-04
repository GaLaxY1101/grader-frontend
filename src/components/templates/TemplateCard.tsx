'use client';

import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/types/index';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ShareTemplateDialog } from './ShareTemplateDialog';

type CourseTemplateResponse = components['schemas']['CourseTemplateResponse'];

interface TemplateCardProps {
  template: CourseTemplateResponse;
  currentTeacherId: number | null;
}

const accentPalette = [
  { from: '#7C3AED', to: '#8B5CF6' },
  { from: '#0891B2', to: '#06B6D4' },
  { from: '#059669', to: '#10B981' },
  { from: '#D97706', to: '#F59E0B' },
  { from: '#DC2626', to: '#EF4444' },
  { from: '#2563EB', to: '#3B82F6' },
];

const DEFAULT_ACCENT = accentPalette[0] as { from: string; to: string };

function getAccent(id: number | undefined): { from: string; to: string } {
  const index = (id ?? 0) % accentPalette.length;
  return accentPalette[index] ?? DEFAULT_ACCENT;
}

export const TemplateCard = ({ template, currentTeacherId }: TemplateCardProps) => {
  const router = useRouter();
  const accent = getAccent(template.id);
  const isOwner = currentTeacherId != null && template.ownerId === currentTeacherId;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const closeMenu = () => setMenuAnchor(null);

  const handleCopy = async () => {
    closeMenu();
    if (template.id == null) return;
    const { data, error } = await apiClient.POST('/api/templates/{id}/copy', {
      params: { path: { id: template.id } },
    });
    if (error || data?.id == null) {
      toast.error('Failed to copy template');
      return;
    }
    toast.success('Template copied');
    router.refresh();
  };

  const handleDelete = async () => {
    closeMenu();
    if (template.id == null) return;
    if (!window.confirm(`Delete template "${template.name}"? This cannot be undone.`)) return;
    const { error } = await apiClient.DELETE('/api/templates/{id}', {
      params: { path: { id: template.id } },
    });
    if (error) {
      toast.error('Failed to delete template');
      return;
    }
    toast.success('Template deleted');
    router.refresh();
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          position: 'relative',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0px 12px 24px -4px rgba(15,23,42,0.12)',
            transform: 'translateY(-3px)',
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${accent.from} 0%, ${accent.to} 100%)`,
            flexShrink: 0,
          }}
        />

        <Box
          component={Link}
          href={`/templates/${template.id}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
              p: 2.5,
              pr: 5,
              '&:last-child': { pb: 2.5 },
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip
                label={isOwner ? 'Owned' : 'Shared with you'}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderRadius: '5px',
                  backgroundColor: isOwner ? '#DBEAFE' : '#FEF3C7',
                  color: isOwner ? '#1E40AF' : '#92400E',
                }}
              />
            </Box>

            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary', fontSize: '1rem' }}
            >
              {template.name ?? '—'}
            </Typography>

            {template.description != null && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.55,
                }}
              >
                {template.description}
              </Typography>
            )}

            <Box
              sx={{
                mt: 'auto',
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">
                Owner: {template.ownerFullName ?? '—'}
              </Typography>
            </Box>
          </CardContent>
        </Box>

        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuAnchor(e.currentTarget);
          }}
          sx={{ position: 'absolute', top: 10, right: 10 }}
          aria-label="Template actions"
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu anchorEl={menuAnchor} open={menuAnchor != null} onClose={closeMenu}>
          <MenuItem onClick={handleCopy}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy template</ListItemText>
          </MenuItem>
          {isOwner && (
            <MenuItem
              onClick={() => {
                closeMenu();
                setShareOpen(true);
              }}
            >
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
          )}
          {isOwner && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Card>

      {template.id != null && (
        <ShareTemplateDialog
          templateId={template.id}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
};
