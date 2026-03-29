import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ users: 0, expenses: 0, pending: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, expensesRes] = await Promise.all([
          api.get('/users'),
          api.get('/expenses/all'),
        ]);

        const users = usersRes.data.users || [];
        const expenses = expensesRes.data.expenses || [];
        const pending = expenses.filter((item) => item.status === 'PENDING').length;

        setMetrics({ users: users.length, expenses: expenses.length, pending });
      } catch {
        setMetrics({ users: 0, expenses: 0, pending: 0 });
      }
    };

    load();
  }, []);

  return (
    <div className="stats-grid">
      <article className="stat-card">
        <p>Total Users</p>
        <h3>{metrics.users}</h3>
      </article>
      <article className="stat-card">
        <p>Total Expenses</p>
        <h3>{metrics.expenses}</h3>
      </article>
      <article className="stat-card">
        <p>Pending Expenses</p>
        <h3>{metrics.pending}</h3>
      </article>
    </div>
  );
}
