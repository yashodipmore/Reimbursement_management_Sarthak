import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ApprovalRules() {
  const [flows, setFlows] = useState([]);
  const [users, setUsers] = useState([]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      condition_type: 'sequential',
      is_manager_approver: false,
    },
  });

  const refreshData = async () => {
    try {
      const [flowsRes, usersRes] = await Promise.all([
        api.get('/approvals/flows'),
        api.get('/users'),
      ]);
      setFlows(flowsRes.data.flows || []);
      setUsers((usersRes.data.users || []).filter((u) => u.role === 'manager' || u.role === 'admin'));
    } catch {
      setFlows([]);
      setUsers([]);
    }
  };

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const [flowsRes, usersRes] = await Promise.all([
          api.get('/approvals/flows'),
          api.get('/users'),
        ]);

        if (!active) return;
        setFlows(flowsRes.data.flows || []);
        setUsers((usersRes.data.users || []).filter((u) => u.role === 'manager' || u.role === 'admin'));
      } catch {
        if (!active) return;
        setFlows([]);
        setUsers([]);
      }
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  const onCreate = async (data) => {
    const approverId = Number(data.approver_id);
    try {
      await api.post('/approvals/flows', {
        name: data.name,
        condition_type: data.condition_type,
        is_manager_approver: Boolean(data.is_manager_approver),
        specific_approver_id: approverId || null,
        steps: approverId ? [{ approver_id: approverId, step_order: 1, label: 'Primary Approver' }] : [],
      });
      toast.success('Approval flow created');
      reset({ condition_type: 'sequential', is_manager_approver: false });
      refreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create flow');
    }
  };

  return (
    <div className="split-grid">
      <section className="panel">
        <div className="panel-head">
          <h2>Create Approval Rule</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit(onCreate)}>
          <div>
            <label htmlFor="flow-name">Flow Name</label>
            <input id="flow-name" {...register('name', { required: true })} />
          </div>

          <div>
            <label htmlFor="condition-type">Condition Type</label>
            <select id="condition-type" {...register('condition_type')}>
              <option value="sequential">sequential</option>
              <option value="specific_approver">specific_approver</option>
              <option value="percentage">percentage</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>

          <div>
            <label htmlFor="approver-id">Primary Approver</label>
            <select id="approver-id" {...register('approver_id')}>
              <option value="">Select approver</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </div>

          <div className="check-row">
            <input id="manager-approver" type="checkbox" {...register('is_manager_approver')} />
            <label htmlFor="manager-approver">Manager must approve first</label>
          </div>

          <button className="btn-primary action-btn" type="submit">Create Flow</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Approval Rules</h2>
        </div>
        {flows.length === 0 ? (
          <p className="muted">No flows created yet.</p>
        ) : (
          <div className="flow-list">
            {flows.map((flow) => (
              <article className="flow-item" key={flow.id}>
                <h3>{flow.name}</h3>
                <p>Type: {flow.condition_type}</p>
                <p>Status: {flow.is_active ? 'Active' : 'Inactive'}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
