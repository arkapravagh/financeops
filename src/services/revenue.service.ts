/**
 * Revenue service: MRR history.
 *
 * Mock-backed today; when the API lands only this file changes.
 */

import { mrrHistory } from "../data/revenue.data";

/** Month-end MRR and paying customers, oldest first. */
export const getMrrHistory = () => mrrHistory;
