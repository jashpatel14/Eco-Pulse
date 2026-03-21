// LeadTimeBadge — days to effectiveDate
import { differenceInDays, parseISO } from 'date-fns';

export default function LeadTimeBadge({ effectiveDate }) {
  if (!effectiveDate) return <span className="lead-badge lead-none">No Date</span>;

  const days = differenceInDays(parseISO(effectiveDate), new Date());

  let cls = 'lead-green';
  let label = `${days}d left`;
  if (days < 0) { cls = 'lead-red';   label = `${Math.abs(days)}d overdue`; }
  else if (days < 14) { cls = 'lead-amber'; }

  return <span className={`lead-badge ${cls}`}>{label}</span>;
}
