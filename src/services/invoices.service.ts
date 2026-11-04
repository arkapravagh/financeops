/**
 * Invoices service: customer invoices (accounts receivable).
 *
 * Mock-backed today; when the API lands only this file changes.
 */

import { invoices } from "../data/invoices.data";

/** All invoices, most recently issued first. */
export const getInvoices = () => [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate));
