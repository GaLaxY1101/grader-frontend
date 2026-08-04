import { type Role } from '@/utils/roles';

export interface NavItem {
  label: string;
  href: string;
  icon: string; // MUI icon name
}

export const navigationConfig: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: 'My Courses', href: '/courses', icon: 'School' },
    { label: 'Archive', href: '/archive', icon: 'Archive' },
  ],
  TEACHER: [
    { label: 'Courses', href: '/courses', icon: 'School' },
    { label: 'Archive', href: '/archive', icon: 'Archive' },
  ],
  ADMIN: [
    { label: 'Courses', href: '/courses', icon: 'School' },
    { label: 'Archive', href: '/archive', icon: 'Archive' },
    { label: 'Users & Groups', href: '/admin', icon: 'ManageAccounts' },
  ],
};
