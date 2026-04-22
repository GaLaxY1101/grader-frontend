import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import Box from '@mui/material/Box';

export default function CoursesLoading() {
  return (
    <Box sx={{ p: 4 }}>
      <LoadingSkeleton rows={6} />
    </Box>
  );
}
