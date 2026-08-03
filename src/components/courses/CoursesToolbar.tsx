'use client';

import type { components } from '@/lib/api/types/index';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type GroupResponse = components['schemas']['GroupResponse'];

interface CoursesToolbarProps {
  groups: GroupResponse[];
  currentQuery: string;
  currentGroupId: number | null;
}

const SEARCH_DEBOUNCE_MS = 300;
const ALL_GROUPS_VALUE = '';

export const CoursesToolbar = ({ groups, currentQuery, currentGroupId }: CoursesToolbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState<string>(currentQuery);

  useEffect(() => {
    setSearchInput(currentQuery);
  }, [currentQuery]);

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    next.delete('page');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  useEffect(() => {
    if (searchInput === currentQuery) return;
    const timer = setTimeout(() => {
      pushParams((params) => {
        if (searchInput.trim() === '') params.delete('query');
        else params.set('query', searchInput.trim());
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    pushParams((params) => {
      if (value === ALL_GROUPS_VALUE) params.delete('groupId');
      else params.set('groupId', value);
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    pushParams((params) => {
      params.delete('query');
      params.delete('groupId');
    });
  };

  const hasActiveFilters = currentQuery.trim() !== '' || currentGroupId != null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { md: 'center' },
        width: '100%',
      }}
    >
      <TextField
        placeholder="Search by course or group name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ flex: 1, minWidth: 0 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="group-filter-label">Group</InputLabel>
        <Select
          labelId="group-filter-label"
          label="Group"
          value={currentGroupId != null ? String(currentGroupId) : ALL_GROUPS_VALUE}
          onChange={handleGroupChange}
        >
          <MenuItem value={ALL_GROUPS_VALUE}>All groups</MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={String(group.id)}>
              {group.code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {hasActiveFilters && (
        <Button variant="text" size="small" onClick={clearFilters}>
          Clear
        </Button>
      )}
    </Box>
  );
};
