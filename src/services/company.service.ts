/** Company service: profile, team, integrations and the prototype's fixed "today" (`AS_OF`). */

import { company } from "../data/company.data";
import { integrations, team } from "../data/workspace.data";
import { parseIso } from "../shared/utils/dates.util";

/** The prototype's fixed "today" so mock data never goes stale. Replace with real date when the API lands. */
export const AS_OF = parseIso("2026-11-02");

/** The company profile. */
export const getCompany = () => company;
/** Workspace members. */
export const getTeam = () => team;
/** Integration placeholders (not connected in the prototype). */
export const getIntegrations = () => integrations;
