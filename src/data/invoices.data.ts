/**
 * Mock data: customer invoices (accounts receivable).
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import { InvoiceStatus } from "../enums/invoice-status.enum";
import type { Invoice } from "../types/finance.types";

/** Invoices with their stored status. "overdue" is never stored; it is derived from `dueDate` vs. today. */
export const invoices = [
  { id: "inv_1038", number: "INV-1038", customer: "Kestrel Foods", issueDate: "2026-08-10", dueDate: "2026-09-09", amountCents: 7_300_00, status: InvoiceStatus.Paid, paidDate: "2026-09-08" },
  { id: "inv_1039", number: "INV-1039", customer: "Ostrander & Vale", issueDate: "2026-08-25", dueDate: "2026-09-24", amountCents: 9_100_00, status: InvoiceStatus.Sent },
  { id: "inv_1041", number: "INV-1041", customer: "Harborline Logistics", issueDate: "2026-09-15", dueDate: "2026-10-15", amountCents: 8_400_00, status: InvoiceStatus.Sent },
  { id: "inv_1042", number: "INV-1042", customer: "Quillfeather Media", issueDate: "2026-09-20", dueDate: "2026-10-20", amountCents: 3_250_00, status: InvoiceStatus.Paid, paidDate: "2026-10-18" },
  { id: "inv_1043", number: "INV-1043", customer: "Ostrander & Vale", issueDate: "2026-10-01", dueDate: "2026-10-31", amountCents: 12_000_00, status: InvoiceStatus.Sent },
  { id: "inv_1044", number: "INV-1044", customer: "Pinecrest Health", issueDate: "2026-10-05", dueDate: "2026-11-04", amountCents: 6_750_00, status: InvoiceStatus.Sent },
  { id: "inv_1045", number: "INV-1045", customer: "Lumen Atlas", issueDate: "2026-10-10", dueDate: "2026-11-09", amountCents: 4_200_00, status: InvoiceStatus.Sent },
  { id: "inv_1046", number: "INV-1046", customer: "Corvid Analytics", issueDate: "2026-10-12", dueDate: "2026-10-27", amountCents: 2_980_00, status: InvoiceStatus.Paid, paidDate: "2026-10-24" },
  { id: "inv_1047", number: "INV-1047", customer: "Harborline Logistics", issueDate: "2026-10-15", dueDate: "2026-11-14", amountCents: 8_400_00, status: InvoiceStatus.Sent },
  { id: "inv_1048", number: "INV-1048", customer: "Tamsin Robotics", issueDate: "2026-10-22", dueDate: "2026-11-21", amountCents: 15_500_00, status: InvoiceStatus.Sent },
  { id: "inv_1049", number: "INV-1049", customer: "Bramblewood Co-op", issueDate: "2026-10-28", dueDate: "2026-11-27", amountCents: 1_850_00, status: InvoiceStatus.Sent },
  { id: "inv_1050", number: "INV-1050", customer: "Northgate Studio", issueDate: "2026-11-02", dueDate: "2026-12-02", amountCents: 5_600_00, status: InvoiceStatus.Draft },
] satisfies Invoice[];
