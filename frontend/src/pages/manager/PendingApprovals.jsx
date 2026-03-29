import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge from '../../components/UI/StatusBadge';

export default function PendingApprovals() {
  const [expenses, setExpenses] = useState([]);
  const [commentById, setCommentById] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/expenses/pending');
      setExpenses(res.data.expenses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const actOnExpense = async (expenseId, action) => {
    try {
      await api.post(`/approvals/${expenseId}/action`, {
        action,
        comment: commentById[expenseId] || '',
      });
      toast.success(`Expense ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Pending Approvals</h2>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : expenses.length === 0 ? (
        <p className="muted">No pending approvals.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.submitter?.name || '-'}</td>
                  <td>{expense.title}</td>
                  <td>{expense.amount} {expense.currency}</td>
                  <td>{expense.date}</td>
                  <td><StatusBadge status={expense.status} /></td>
                  <td>
                    <input
                      className="mini-input"
                      placeholder="Optional comment"
                      value={commentById[expense.id] || ''}
                      onChange={(e) => setCommentById((prev) => ({ ...prev, [expense.id]: e.target.value }))}
                    />
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="btn-secondary tiny" onClick={() => actOnExpense(expense.id, 'APPROVE')}>Approve</button>
                      <button className="btn-danger tiny" onClick={() => actOnExpense(expense.id, 'REJECT')}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
