import { invoices } from "../data/invoices";

export const getInvoices = () => [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate));
