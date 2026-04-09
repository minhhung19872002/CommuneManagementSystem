export type AppRole = 'Admin' | 'NhanKhau' | 'HoKhau';

export const routePermissions: Record<string, AppRole[]> = {
  '/': ['Admin', 'NhanKhau', 'HoKhau'],
  '/households': ['Admin', 'HoKhau'],
  '/persons': ['Admin', 'NhanKhau', 'HoKhau'],
  '/temporary-residence': ['Admin', 'NhanKhau'],
  '/temporary-absence': ['Admin', 'NhanKhau'],
  '/notifications': ['Admin', 'NhanKhau', 'HoKhau'],
  '/meetings': ['Admin', 'NhanKhau', 'HoKhau'],
  '/library': ['Admin', 'NhanKhau', 'HoKhau'],
  '/feedback': ['Admin', 'NhanKhau', 'HoKhau'],
  '/tasks': ['Admin', 'NhanKhau', 'HoKhau'],
  '/projects': ['Admin', 'NhanKhau', 'HoKhau'],
  '/reports': ['Admin', 'NhanKhau', 'HoKhau'],
  '/login-history': ['Admin', 'NhanKhau', 'HoKhau'],
  '/human-resources': ['Admin'],
  '/users': ['Admin'],
  '/logs': ['Admin'],
  '/settings': ['Admin'],
  '/catalogs': ['Admin'],
  '/user-groups': ['Admin'],
  '/backup': ['Admin'],
};

export const defaultRouteForRole = (role?: string | null) => {
  if (role === 'NhanKhau') return '/persons';
  if (role === 'HoKhau') return '/households';
  return '/';
};

export const hasRouteAccess = (role: string | null | undefined, path: string) => {
  if (!role) return false;
  const allowedRoles = routePermissions[path];
  return allowedRoles ? allowedRoles.includes(role as AppRole) : false;
};
