import React from 'react';

const STATUS_MAP = {
  // Invoice / Quotation
  DRAFT:     { label: 'Draft',     cls: 'badge-gray' },
  SENT:      { label: 'Sent',      cls: 'badge-blue' },
  VIEWED:    { label: 'Viewed',    cls: 'badge-purple' },
  ACCEPTED:  { label: 'Accepted',  cls: 'badge-green' },
  REJECTED:  { label: 'Rejected',  cls: 'badge-red' },
  EXPIRED:   { label: 'Expired',   cls: 'badge-orange' },
  PAID:      { label: 'Paid',      cls: 'badge-green' },
  PARTIAL:   { label: 'Partial',   cls: 'badge-yellow' },
  OVERDUE:   { label: 'Overdue',   cls: 'badge-red' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-gray' },
  // Expense
  PENDING:   { label: 'Pending',   cls: 'badge-yellow' },
  APPROVED:  { label: 'Approved',  cls: 'badge-green' },
  // PO
  DELIVERED: { label: 'Delivered', cls: 'badge-green' },
  // Payment
  REFUNDED:  { label: 'Refunded',  cls: 'badge-orange' },
  // Boolean
  true:      { label: 'Yes',       cls: 'badge-green' },
  false:     { label: 'No',        cls: 'badge-red' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, cls: 'badge-gray' };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
