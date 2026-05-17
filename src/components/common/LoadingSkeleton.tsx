import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface LoadingSkeletonProps {
  rows?: number;
  height?: number;
}

export const LoadingSkeleton = ({ rows = 3, height = 88 }: LoadingSkeletonProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={height}
          animation="wave"
          sx={{ borderRadius: '10px' }}
        />
      ))}
    </Box>
  );
};
