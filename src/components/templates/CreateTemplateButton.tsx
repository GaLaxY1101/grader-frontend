'use client';

import { CreateTemplateDialog } from '@/components/templates/CreateTemplateDialog';
import Button from '@mui/material/Button';
import { useState } from 'react';

export const CreateTemplateButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create Template
      </Button>
      <CreateTemplateDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
