export default function roleHomePath(role) {
  if (role === 'admin') return '/app/admin/dashboard';
  if (role === 'manager') return '/app/manager/dashboard';
  return '/app/employee/dashboard';
}
