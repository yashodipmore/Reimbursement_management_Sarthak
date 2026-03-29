import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { role: 'employee' },
  });

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onCreate = async (data) => {
    try {
      await api.post('/users', data);
      toast.success('User created');
      reset({ role: 'employee' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-head">
          <h2>Create User</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit(onCreate)}>
          <div>
            <label htmlFor="user-name">Name</label>
            <input id="user-name" {...register('name', { required: true })} />
          </div>
          <div>
            <label htmlFor="user-email">Email</label>
            <input id="user-email" type="email" {...register('email', { required: true })} />
          </div>
          <div>
            <label htmlFor="user-password">Temporary Password</label>
            <input id="user-password" type="text" {...register('password', { required: true, minLength: 6 })} />
          </div>
          <div>
            <label htmlFor="user-role">Role</label>
            <select id="user-role" {...register('role')}>
              <option value="employee">employee</option>
              <option value="manager">manager</option>
            </select>
          </div>
          <button className="btn-primary action-btn" type="submit">Create User</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Company Users</h2>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.is_active ? 'Yes' : 'No'}</td>
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
