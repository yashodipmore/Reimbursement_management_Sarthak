import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/UI/StatusBadge';

export default function MyExpenses() {
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

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>My Expenses</h2>
      </div>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : expenses.length === 0 ? (
        <p className="muted">No expenses found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.title}</td>
                  <td>{expense.amount} {expense.currency}</td>
                  <td>{expense.category}</td>
                  <td>{expense.date}</td>
                  <td><StatusBadge status={expense.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
