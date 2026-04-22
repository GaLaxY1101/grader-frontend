import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton = ({ rows = 3 }: LoadingSkeletonProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
      ))}
    </Box>
  );
};
