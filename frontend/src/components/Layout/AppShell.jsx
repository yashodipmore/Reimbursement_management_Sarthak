import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';

export default function AppShell() {
  const { user } = useAuthStore();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <header className="app-header">
          <h1>{user?.company_name || 'Reimbursement Management'}</h1>
          <p>{user?.name} • {user?.email}</p>
        </header>
        <section className="app-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
