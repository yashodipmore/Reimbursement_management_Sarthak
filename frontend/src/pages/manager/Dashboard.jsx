import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManagerDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingRes, teamRes] = await Promise.all([
          api.get('/expenses/pending'),
          api.get('/users/me/team'),
        ]);
        setPendingCount((pendingRes.data.expenses || []).length);
        setTeamCount((teamRes.data.team || []).length);
      } catch {
        setPendingCount(0);
        setTeamCount(0);
      }
    };

    load();
  }, []);

  return (
    <div className="stats-grid">
      <article className="stat-card">
        <p>Pending Approvals</p>
        <h3>{pendingCount}</h3>
      </article>
      <article className="stat-card">
        <p>Team Members</p>
        <h3>{teamCount}</h3>
      </article>
    </div>
  );
}
