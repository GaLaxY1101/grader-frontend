import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export default function CourseDetailLoading() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4 }}>
      <Skeleton variant="rectangular" height={48} width={300} />
      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
