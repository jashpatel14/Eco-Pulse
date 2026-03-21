// StatusBadge — reusable pill badge for entity statuses
const STATUS_STYLES = {
  ACTIVE:    'badge-active',
  ARCHIVED:  'badge-archived',
  DRAFT:     'badge-draft',
  IN_REVIEW: 'badge-in-review',
  APPROVED:  'badge-approved',
  REJECTED:  'badge-rejected',
  APPLIED:   'badge-applied',
};

const STATUS_LABELS = {
  ACTIVE:    'Active',
  ARCHIVED:  'Archived',
  DRAFT:     'Draft',
  IN_REVIEW: 'In Review',
  APPROVED:  'Approved',
  REJECTED:  'Rejected',
  APPLIED:   'Applied',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${STATUS_STYLES[status] || 'badge-archived'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
