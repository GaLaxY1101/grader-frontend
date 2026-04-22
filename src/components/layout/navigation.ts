import { type Role } from '@/utils/roles';

export interface NavItem {
  label: string;
  href: string;
  icon: string; // MUI icon name
}

export const navigationConfig: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
    { label: 'My Courses', href: '/courses', icon: 'School' },
  ],
  TEACHER: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
    { label: 'Courses', href: '/courses', icon: 'School' },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
    { label: 'Courses', href: '/courses', icon: 'School' },
    { label: 'Users & Groups', href: '/admin', icon: 'ManageAccounts' },
  ],
};
