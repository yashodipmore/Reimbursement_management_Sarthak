import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ApprovalRules() {
  const [flows, setFlows] = useState([]);
  const [users, setUsers] = useState([]);
  const [conditionType, setConditionType] = useState('sequential');
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      condition_type: 'sequential',
      is_manager_approver: false,
      approver_id: '',
      specific_approver_id: '',
      percentage_threshold: '',
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
    const approverId = data.approver_id ? Number(data.approver_id) : null;
    const specificApproverId = data.specific_approver_id ? Number(data.specific_approver_id) : null;
    const percentageThreshold = data.percentage_threshold
      ? Number(data.percentage_threshold)
      : null;

    if (['percentage', 'hybrid'].includes(data.condition_type)) {
      if (!percentageThreshold || percentageThreshold <= 0 || percentageThreshold > 100) {
        toast.error('Percentage threshold must be between 1 and 100');
        return;
      }
    }

    if (['specific_approver', 'hybrid'].includes(data.condition_type) && !specificApproverId) {
      toast.error('Please select a specific approver');
      return;
    }

    try {
      await api.post('/approvals/flows', {
        name: data.name,
        condition_type: data.condition_type,
        is_manager_approver: Boolean(data.is_manager_approver),
        percentage_threshold: ['percentage', 'hybrid'].includes(data.condition_type)
          ? percentageThreshold
          : null,
        specific_approver_id: ['specific_approver', 'hybrid'].includes(data.condition_type)
          ? specificApproverId
          : null,
        steps: approverId
          ? [{ approver_id: approverId, step_order: 1, label: 'Primary Approver' }]
          : [],
      });
      toast.success('Approval flow created');
      reset({
        condition_type: 'sequential',
        is_manager_approver: false,
        approver_id: '',
        specific_approver_id: '',
        percentage_threshold: '',
      });
      setConditionType('sequential');
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
            <select
              id="condition-type"
              {...register('condition_type')}
              onChange={(event) => setConditionType(event.target.value)}
            >
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

          {['percentage', 'hybrid'].includes(conditionType) && (
            <div>
              <label htmlFor="percentage-threshold">Percentage Threshold</label>
              <input
                id="percentage-threshold"
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 60"
                {...register('percentage_threshold')}
              />
            </div>
          )}

          {['specific_approver', 'hybrid'].includes(conditionType) && (
            <div>
              <label htmlFor="specific-approver-id">Specific Approver</label>
              <select id="specific-approver-id" {...register('specific_approver_id')}>
                <option value="">Select specific approver</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
            </div>
          )}

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
