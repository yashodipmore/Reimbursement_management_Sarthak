const toneClass = {
  PENDING: 'badge badge-pending',
  APPROVED: 'badge badge-approved',
  REJECTED: 'badge badge-rejected',
  pending: 'badge badge-pending',
  approved: 'badge badge-approved',
  rejected: 'badge badge-rejected',
};

export default function StatusBadge({ status }) {
  const label = String(status || 'PENDING');
  const className = toneClass[label] || 'badge badge-pending';

  return <span className={className}>{label.toUpperCase()}</span>;
}
