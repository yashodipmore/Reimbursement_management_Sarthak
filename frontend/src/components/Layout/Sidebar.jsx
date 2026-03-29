import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineDocumentAdd,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineAdjustments,
  HiOutlineLogout,
} from 'react-icons/hi';
import useAuthStore from '../../store/authStore';

const navByRole = {
  employee: [
    { to: '/app/employee/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/app/employee/submit-expense', label: 'Submit Expense', icon: HiOutlineDocumentAdd },
    { to: '/app/employee/my-expenses', label: 'My Expenses', icon: HiOutlineClipboardList },
  ],
  manager: [
    { to: '/app/manager/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/app/manager/pending-approvals', label: 'Pending Approvals', icon: HiOutlineCheckCircle },
  ],
  admin: [
    { to: '/app/admin/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { to: '/app/admin/users', label: 'Users', icon: HiOutlineUsers },
    { to: '/app/admin/approval-rules', label: 'Approval Rules', icon: HiOutlineAdjustments },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const role = user?.role || 'employee';
  const items = navByRole[role] || navByRole.employee;

  return (
    <aside className="app-sidebar">
      <div>
        <div className="brand-block">
          <p className="brand-kicker">Reimbursement</p>
          <h2 className="brand-title">Control Center</h2>
          <p className="brand-role">{role.toUpperCase()}</p>
        </div>

        <nav className="menu-list" aria-label="Primary navigation">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `menu-link ${isActive ? 'menu-link-active' : ''}`}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <button type="button" className="logout-btn" onClick={logout}>
        <HiOutlineLogout aria-hidden="true" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
