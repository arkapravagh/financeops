/**
 * English labels for the FinanceOps AI panel UI (header, history, empty state, messages, composer).
 *
 * The demo engine's answer text lives in `services/assistant.service.ts` on purpose: it stands in for prose the
 * real backend (Claude) will generate, so it isn't UI copy.
 */

/** Text in the AI panel, its messages and composer. */
export const assistantLabels = {
  name: "FinanceOps AI",
  dockLabel: "FinanceOps AI assistant",
  demoMode: "Demo mode: answers come from sample data",
  newChat: "New chat",
  history: "Chat history",
  recentChats: "Recent chats",
  noConversations: "No conversations yet",
  deleteChat: (title: string) => `Delete chat: ${title}`,
  close: "Close assistant",
  closeTitle: "Close (Ctrl+J)",
  justNow: "just now",
  minutesAgo: (m: number) => `${m}m ago`,
  hoursAgo: (h: number) => `${h}h ago`,
  daysAgo: (d: number) => `${d}d ago`,
  emptyTitle: "How can I help?",
  emptyBody: (company: string) => `Ask anything about ${company}'s finances. I'll answer from your live numbers.`,
  scrollToLatest: "Scroll to latest",
  message: {
    thinking: "Assistant is thinking",
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
  composer: {
    label: "Message FinanceOps AI",
    placeholder: "Ask about cash, burn, invoices…",
    attachTitle: "Attachments — coming soon",
    attach: "Attach file (coming soon)",
    contextTitle: "The assistant knows which page you're on",
    stop: "Stop generating",
    stopTitle: "Stop (Esc)",
    send: "Send message",
    sendTitle: "Send (Enter)",
    disclaimer: "AI can make mistakes. Verify important numbers. Not financial advice.",
  },
} as const;
