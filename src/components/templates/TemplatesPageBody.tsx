import { CreateTemplateButton } from '@/components/templates/CreateTemplateButton';
import { TemplatesResults } from '@/components/templates/TemplatesResults';
import { TemplatesToolbar } from '@/components/templates/TemplatesToolbar';
import { getCurrentTeacher, getTemplates } from '@/lib/api/templates';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

interface TemplatesPageBodyProps {
  query: string;
  page: number;
  isAdmin: boolean;
}

export const TemplatesPageBody = async ({ query, page, isAdmin }: TemplatesPageBodyProps) => {
  let templatesPage: Awaited<ReturnType<typeof getTemplates>>;
  let currentTeacher: Awaited<ReturnType<typeof getCurrentTeacher>>;
  try {
    [templatesPage, currentTeacher] = await Promise.all([
      getTemplates({
        query: query.trim() === '' ? undefined : query.trim(),
        page,
      }),
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

  const currentTeacherId = currentTeacher?.id ?? null;
  const subtitle = isAdmin ? 'All templates' : 'Templates you own or that were shared with you';

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}
            >
              Templates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          </Box>
          <CreateTemplateButton />
        </CardContent>
        <Divider />
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <TemplatesToolbar currentQuery={query} />
        </CardContent>
      </Card>

      <TemplatesResults
        templates={templatesPage?.content ?? []}
        currentTeacherId={currentTeacherId}
        currentPage={templatesPage?.page ?? 0}
        totalPages={templatesPage?.totalPages ?? 0}
        totalElements={templatesPage?.totalElements ?? 0}
        emptyDescription={
          query.trim() !== '' ? 'Try adjusting your search' : "You don't have any templates yet"
        }
      />
    </Box>
  );
};
