import { TemplateAssignmentsList } from '@/components/templates/TemplateAssignmentsList';
import { TemplateDetailHeader } from '@/components/templates/TemplateDetailHeader';
import { getCurrentTeacher, getTemplateById } from '@/lib/api/templates';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

interface TemplateDetailBodyProps {
  templateId: number;
  isAdmin: boolean;
}

export const TemplateDetailBody = async ({ templateId, isAdmin }: TemplateDetailBodyProps) => {
  let template: Awaited<ReturnType<typeof getTemplateById>>;
  let currentTeacher: Awaited<ReturnType<typeof getCurrentTeacher>>;
  try {
    [template, currentTeacher] = await Promise.all([
      getTemplateById(templateId),
      getCurrentTeacher(),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{message}</Alert>
      </Box>
    );
  }

  if (!template) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Template not found</Alert>
      </Box>
    );
  }

  const currentTeacherId = currentTeacher?.id ?? null;
  const isOwner = currentTeacherId != null && template.ownerId === currentTeacherId;
  const canEdit = isOwner || isAdmin;

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TemplateDetailHeader template={template} isOwner={isOwner} canEdit={canEdit} />
      <TemplateAssignmentsList
        templateId={templateId}
        assignments={template.assignments ?? []}
        canEdit={canEdit}
      />
    </Box>
  );
};
