// Single source of truth for read state. Badges and counts are derived from it.
export function createInbox(conversations, api = { persistRead: async () => {} }) {
  const state = new Map(conversations.map((c) => [c.id, { ...c }]));

  const unreadOf = (c) => (c ? c.unread : 0);
  const isUnread = (id) => unreadOf(state.get(id)) > 0;
  const unreadCount = () => [...state.values()].reduce((n, c) => n + c.unread, 0);

  async function markAsRead(id) {
    const c = state.get(id);
    if (!c || c.unread === 0) return; // missing or already read: no-op
    const previous = c.unread;
    c.unread = 0; // optimistic update
    try {
      await api.persistRead(id);
    } catch (err) {
      c.unread = previous; // revert so the badge returns
      throw err;
    }
  }

  function receive(id, count = 1) {
    const c = state.get(id);
    if (c) c.unread += count;
  }

  return { isUnread, unreadCount, markAsRead, receive };
}
