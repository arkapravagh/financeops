import { company } from "../data/company";
import { integrations, team } from "../data/workspace";
import { parseIso } from "../lib/dates";

/** The prototype's fixed "today" so mock data never goes stale. Replace with real date when the API lands. */
export const AS_OF = parseIso("2026-11-02");

export const getCompany = () => company;
export const getTeam = () => team;
export const getIntegrations = () => integrations;
