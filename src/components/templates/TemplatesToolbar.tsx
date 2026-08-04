'use client';

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TemplatesToolbarProps {
  currentQuery: string;
}

export const TemplatesToolbar = ({ currentQuery }: TemplatesToolbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query === currentQuery) return;
      const next = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();
      if (trimmed === '') next.delete('query');
      else next.set('query', trimmed);
      next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, currentQuery, pathname, router, searchParams]);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      <TextField
        placeholder="Search templates by name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="small"
        sx={{ flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
