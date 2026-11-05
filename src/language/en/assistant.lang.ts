/**
 * English labels for the Elisa panel UI (header, history, empty state, messages, composer).
 *
 * The demo engine's answer text lives in `services/assistant.service.ts` on purpose: it stands in for prose the
 * real backend (Claude) will generate, so it isn't UI copy.
 */

import { MessageStatus } from "../../enums/message-status.enum";

/** Text in the AI panel, its messages and composer. */
export const assistantLabels = {
  name: "Elisa",
  dockLabel: "Elisa, your AI finance assistant",
  demoMode: "Demo mode: answers come from sample data",
  /** Small pill in the header; `demoMode` is its tooltip. */
  demoBadge: "Demo",
  /** Header title before the first message of a conversation. */
  newChatTitle: "New chat",
  newChat: "New chat",
  feedback: "Feedback",
  history: "Chat history",
  recentChats: "Recent chats",
  noConversations: "No conversations yet",
  deleteChat: (title: string) => `Delete chat: ${title}`,
  close: "Close Elisa",
  closeTitle: "Close (Ctrl+J)",
  justNow: "just now",
  minutesAgo: (m: number) => `${m}m ago`,
  hoursAgo: (h: number) => `${h}h ago`,
  daysAgo: (d: number) => `${d}d ago`,
  emptyTitle: "Start a conversation with Elisa.",
  emptyTip: "Tip: click + to attach files or run a command.",
  /** Heading above the page's starter prompts in the empty state. */
  suggestions: "Suggested for this page",
  /**
   * Starter prompts per page (empty-state chips, follow-ups after "take me to …"). Keys are route prefixes; "/" is the
   * fallback. Each prompt matches an intent the demo engine answers.
   */
  pageSuggestions: {
    "/budgets": ["Which categories are over budget?", "Why did burn go up?", "How can we extend runway by 6 months?", "Explain this page"],
    "/invoices": ["Which invoices should I chase?", "Draft a polite reminder email", "How long do customers take to pay?", "Explain this page"],
    "/reports": ["Summarize last month", "Draft an investor update", "What's my cash balance?", "Explain this page"],
    "/forecast": ["What if we hire 3 engineers?", "How can we extend runway by 6 months?", "When should we start fundraising?", "Explain this page"],
    "/ai-spend": ["Where is our AI spend going?", "How can we cut AI costs?", "Which categories are over budget?", "Explain this page"],
    "/transactions": ["Why did burn go up?", "What bills are due this week?", "What's my cash balance?", "Summarize last month"],
    "/": ["What's my runway?", "Summarize last month", "Which invoices should I chase?", "What if we hire 3 engineers?"],
  },
  scrollToLatest: "Scroll to latest",
  /** Screen-reader announcements when the latest reply changes state (announced once, not per word). */
  liveStatus: {
    [MessageStatus.Thinking]: "Elisa is working on a reply.",
    [MessageStatus.Streaming]: "Elisa is writing a reply.",
    [MessageStatus.Done]: "Reply ready.",
    [MessageStatus.Stopped]: "Reply stopped.",
    [MessageStatus.Error]: "The reply failed.",
  } satisfies Record<MessageStatus, string>,
  message: {
    thinking: "Elisa is thinking",
    analyzing: "Analyzing your numbers…",
    stopped: "Stopped.",
    failed: "The reply failed. Try regenerating.",
    failedContent: "Something went wrong. Please try again.",
    sources: "Sources",
    copy: "Copy",
    copyReply: "Copy reply",
    copied: "Copied",
    regenerate: "Regenerate",
    regenerateReply: "Regenerate reply",
    good: "Good response",
    bad: "Bad response",
  },
  /** Cursor mode: Elisa moves a visible cursor to the screen an answer is about. */
  cursor: {
    /** Name tag next to the AI cursor. */
    name: "Elisa",
    mode: "Cursor mode",
    modeOnTitle: "On: after answering, Elisa takes you to the screen the answer is about",
    modeOffTitle: "Off: Elisa only answers. Use Go to on an answer to see it on screen",
    /** "Runway on Overview". */
    place: (section: string, page: string) => `${section} on ${page}`,
    goTo: (place: string) => `Go to ${place}`,
    /** Screen-reader announcement once the cursor has landed. */
    announce: (place: string) => `Elisa opened ${place}.`,
  },
  composer: {
    label: "Message Elisa",
    placeholder: "Ask anything…",
    /** The + button: opens attachments and commands. */
    more: "Attach files and commands",
    attachFiles: "Attach files",
    commandsHeading: "Commands",
    /** Prompts the + menu inserts into the input. Each matches an intent the demo engine answers. */
    commands: [
      "Summarize last month",
      "What's my runway?",
      "Which invoices should I chase?",
      "What if we hire 3 engineers?",
      "Draft an investor update",
      "Take me to Reports",
    ],
    contextTitle: "Elisa knows which page you're on",
    dictate: "Dictate",
    voiceMode: "Voice mode",
    stop: "Stop generating",
    stopTitle: "Stop (Esc)",
    send: "Send message",
    sendTitle: "Send (Enter)",
    disclaimer: "AI can make mistakes. Verify important numbers. Not financial advice.",
  },
} as const;
