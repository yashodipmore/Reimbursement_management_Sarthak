import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/UI/StatusBadge';

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

export default function EmployeeDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/expenses/mine');
        setExpenses(res.data.expenses || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const total = expenses.length;
    const approved = expenses.filter((e) => e.status === 'APPROVED').length;
    const pending = expenses.filter((e) => e.status === 'PENDING').length;
    const rejected = expenses.filter((e) => e.status === 'REJECTED').length;
    return { total, approved, pending, rejected };
  }, [expenses]);

  return (
    <div className="page-grid">
      <div className="stats-grid">
        <StatCard label="Total Expenses" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Rejected" value={stats.rejected} />
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Recent Expenses</h2>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="muted">No expenses yet. Submit your first claim.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 6).map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>{expense.amount} {expense.currency}</td>
                    <td>{expense.date}</td>
                    <td><StatusBadge status={expense.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
