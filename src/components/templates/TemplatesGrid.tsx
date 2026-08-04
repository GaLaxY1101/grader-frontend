'use client';

import { TemplateCard } from '@/components/templates/TemplateCard';
import type { components } from '@/lib/api/types/index';
import Grid from '@mui/material/Grid';

type CourseTemplateResponse = components['schemas']['CourseTemplateResponse'];

interface TemplatesGridProps {
  templates: CourseTemplateResponse[];
  currentTeacherId: number | null;
}

export const TemplatesGrid = ({ templates, currentTeacherId }: TemplatesGridProps) => {
  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <TemplateCard template={template} currentTeacherId={currentTeacherId} />
        </Grid>
      ))}
    </Grid>
  );
};
