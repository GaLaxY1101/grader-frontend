'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { TemplatesGrid } from '@/components/templates/TemplatesGrid';
import type { components } from '@/lib/api/types/index';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type CourseTemplateResponse = components['schemas']['CourseTemplateResponse'];

interface TemplatesResultsProps {
  templates: CourseTemplateResponse[];
  currentTeacherId: number | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  emptyDescription: string;
}

export const TemplatesResults = ({
  templates,
  currentTeacherId,
  currentPage,
  totalPages,
  totalElements,
  emptyDescription,
}: TemplatesResultsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (_event: unknown, page: number) => {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 1) next.delete('page');
    else next.set('page', String(page - 1));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {totalElements === 0
            ? 'No templates'
            : `${totalElements} template${totalElements === 1 ? '' : 's'}`}
        </Typography>
        {totalPages > 1 && (
          <Typography variant="body2" color="text.secondary">
            Page {currentPage + 1} of {totalPages}
          </Typography>
        )}
      </Stack>

      {templates.length === 0 ? (
        <EmptyState title="No templates found" description={emptyDescription} />
      ) : (
        <TemplatesGrid templates={templates} currentTeacherId={currentTeacherId} />
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage + 1}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};
