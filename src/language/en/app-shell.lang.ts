/**
 * English labels for the app shell: sidebar, top bar and the mobile navigation drawer.
 */

/** Text in the sidebar, top bar and mobile drawer. */
export const appShellLabels = {
  navigation: "Navigation",
  mainNavigation: "Main",
  openNavigation: "Open navigation",
  closeNavigation: "Close navigation",
  expandSidebar: "Expand sidebar",
  collapseSidebar: "Collapse sidebar",
  search: "Search",
  searchPlaceholder: "Search transactions, invoices, vendors…",
  dataAsOf: (date: string) => `Data as of ${date}`,
  askAi: "Ask AI",
  askAiTitle: "Ask AI (Ctrl+J)",
  askAiShortcut: "Ctrl J",
  openAssistant: "Open AI assistant",
  closeAssistant: "Close AI assistant",
  notifications: "Notifications",
  switchToLight: "Switch to light theme",
  switchToDark: "Switch to dark theme",
  signedInAs: (name: string) => `Signed in as ${name}`,
  /** Company line under the name in the sidebar, e.g. "Seed, 12 people". */
  companySummary: (stage: string, headcount: number) => `${stage}, ${headcount} people`,
  sampleDataUser: (name: string) => `${name} (sample data)`,
  sampleDataNote: "Prototype with sample data",
} as const;
