import api from '../../../api/axios';

// ── Dashboard ────────────────────────────────────────────────────────
export const fetchDashboard = () => api.get('/cfo/dashboard').then((r) => r.data.data);

// ── Quotations ───────────────────────────────────────────────────────
export const fetchQuotations  = (params) => api.get('/cfo/quotations', { params }).then((r) => r.data);
export const fetchQuotation   = (id)     => api.get(`/cfo/quotations/${id}`).then((r) => r.data.data);
export const createQuotation  = (data)   => api.post('/cfo/quotations', data).then((r) => r.data.data);
export const updateQuotation  = (id, data) => api.put(`/cfo/quotations/${id}`, data).then((r) => r.data.data);
export const deleteQuotation  = (id)     => api.delete(`/cfo/quotations/${id}`).then((r) => r.data);
export const convertQuotation = (id, data) => api.post(`/cfo/quotations/${id}/convert`, data).then((r) => r.data.data);
export const updateQuotationStatus = (id, status) => api.patch(`/cfo/quotations/${id}/status`, { status }).then((r) => r.data.data);

// ── Invoices ─────────────────────────────────────────────────────────
export const fetchInvoices    = (params) => api.get('/cfo/invoices', { params }).then((r) => r.data);
export const fetchInvoice     = (id)     => api.get(`/cfo/invoices/${id}`).then((r) => r.data.data);
export const createInvoice    = (data)   => api.post('/cfo/invoices', data).then((r) => r.data.data);
export const updateInvoice    = (id, data) => api.put(`/cfo/invoices/${id}`, data).then((r) => r.data.data);
export const deleteInvoice    = (id)     => api.delete(`/cfo/invoices/${id}`).then((r) => r.data);
export const updateInvoiceStatus = (id, status) => api.patch(`/cfo/invoices/${id}/status`, { status }).then((r) => r.data.data);

// ── Payments ─────────────────────────────────────────────────────────
export const fetchPayments    = (params) => api.get('/cfo/payments', { params }).then((r) => r.data);
export const fetchPayment     = (id)     => api.get(`/cfo/payments/${id}`).then((r) => r.data.data);
export const createPayment    = (data)   => api.post('/cfo/payments', data).then((r) => r.data.data);
export const refundPayment    = (id)     => api.post(`/cfo/payments/${id}/refund`).then((r) => r.data.data);
export const deletePayment    = (id)     => api.delete(`/cfo/payments/${id}`).then((r) => r.data);

// ── Expenses ─────────────────────────────────────────────────────────
export const fetchExpenses    = (params) => api.get('/cfo/expenses', { params }).then((r) => r.data);
export const fetchExpense     = (id)     => api.get(`/cfo/expenses/${id}`).then((r) => r.data.data);
export const createExpense    = (data)   => api.post('/cfo/expenses', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
export const updateExpense    = (id, data) => api.put(`/cfo/expenses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
export const approveExpense   = (id)     => api.patch(`/cfo/expenses/${id}/approve`).then((r) => r.data.data);
export const rejectExpense    = (id, reason) => api.patch(`/cfo/expenses/${id}/reject`, { reason }).then((r) => r.data.data);
export const deleteExpense    = (id)     => api.delete(`/cfo/expenses/${id}`).then((r) => r.data);

// ── Payroll ──────────────────────────────────────────────────────────
export const fetchPayrolls    = (params) => api.get('/cfo/payroll', { params }).then((r) => r.data);
export const fetchPayroll     = (id)     => api.get(`/cfo/payroll/${id}`).then((r) => r.data.data);
export const createPayroll    = (data)   => api.post('/cfo/payroll', data).then((r) => r.data.data);
export const updatePayroll    = (id, data) => api.put(`/cfo/payroll/${id}`, data).then((r) => r.data.data);
export const markPayrollPaid  = (id)     => api.patch(`/cfo/payroll/${id}/mark-paid`).then((r) => r.data.data);
export const deletePayroll    = (id)     => api.delete(`/cfo/payroll/${id}`).then((r) => r.data);
export const fetchEmployees   = ()       => api.get('/cfo/payroll/employees').then((r) => r.data.data);

// ── Vendors ──────────────────────────────────────────────────────────
export const fetchVendors     = (params) => api.get('/cfo/vendors', { params }).then((r) => r.data);
export const fetchVendor      = (id)     => api.get(`/cfo/vendors/${id}`).then((r) => r.data.data);
export const createVendor     = (data)   => api.post('/cfo/vendors', data).then((r) => r.data.data);
export const updateVendor     = (id, data) => api.put(`/cfo/vendors/${id}`, data).then((r) => r.data.data);
export const deleteVendor     = (id)     => api.delete(`/cfo/vendors/${id}`).then((r) => r.data);

// ── Purchase Orders ──────────────────────────────────────────────────
export const fetchPurchaseOrders  = (params) => api.get('/cfo/purchase-orders', { params }).then((r) => r.data);
export const fetchPurchaseOrder   = (id)     => api.get(`/cfo/purchase-orders/${id}`).then((r) => r.data.data);
export const createPurchaseOrder  = (data)   => api.post('/cfo/purchase-orders', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
export const updatePurchaseOrder  = (id, data) => api.put(`/cfo/purchase-orders/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
export const deletePurchaseOrder  = (id)     => api.delete(`/cfo/purchase-orders/${id}`).then((r) => r.data);

// ── Reports ──────────────────────────────────────────────────────────
export const fetchRevenueReport   = (params) => api.get('/cfo/reports/revenue', { params }).then((r) => r.data.data);
export const fetchExpenseReport   = (params) => api.get('/cfo/reports/expenses', { params }).then((r) => r.data.data);
export const fetchProfitLoss      = (params) => api.get('/cfo/reports/profit-loss', { params }).then((r) => r.data.data);
export const fetchCashFlow        = (params) => api.get('/cfo/reports/cash-flow', { params }).then((r) => r.data.data);
export const fetchOutstanding     = ()       => api.get('/cfo/reports/outstanding').then((r) => r.data.data);
export const fetchPayrollReport   = (params) => api.get('/cfo/reports/payroll', { params }).then((r) => r.data.data);
export const fetchInvoiceReport   = (params) => api.get('/cfo/reports/invoices', { params }).then((r) => r.data.data);

// ── Documents ────────────────────────────────────────────────────────
export const fetchDocuments   = (params) => api.get('/cfo/documents', { params }).then((r) => r.data);
export const uploadDocument   = (data)   => api.post('/cfo/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);
export const deleteDocument   = (id)     => api.delete(`/cfo/documents/${id}`).then((r) => r.data);

// ── Settings ─────────────────────────────────────────────────────────
export const fetchSettings    = ()       => api.get('/cfo/settings').then((r) => r.data.data);
export const saveSettings     = (data)   => api.put('/cfo/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data);

// ── Contacts (for dropdowns — uses existing CRM contacts) ──────────────
export const fetchContacts = (params) => api.get('/contacts', { params }).then((r) => {
  // Normalize existing contacts (firstName/lastName) to name field
  const data = r.data?.data || r.data || [];
  const normalized = Array.isArray(data) ? data.map(c => ({
    ...c,
    name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
  })) : data;
  return { data: normalized };
});
