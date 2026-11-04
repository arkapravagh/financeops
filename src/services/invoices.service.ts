import { invoices } from "../data/invoices.data";

export const getInvoices = () => [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate));
