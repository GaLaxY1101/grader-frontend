'use client';

import { apiClient } from '@/lib/api/client';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface RestoreCourseButtonProps {
  courseId: number;
}

export const RestoreCourseButton = ({ courseId }: RestoreCourseButtonProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleRestore = async () => {
    setSubmitting(true);
    try {
      const { error } = await apiClient.POST('/api/courses/{id}/activate', {
        params: { path: { id: courseId } },
      });
      if (error) {
        toast.error('Failed to restore course');
        return;
      }
      toast.success('Course restored');
      router.push('/courses');
      router.refresh();
    } catch {
      toast.error('Failed to restore course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoadingButton
      variant="contained"
      color="success"
      startIcon={<UnarchiveIcon />}
      onClick={handleRestore}
      loading={submitting}
    >
      Restore
    </LoadingButton>
  );
};
