import test from 'node:test';
import assert from 'node:assert/strict';
import { createInbox } from '../src/inbox.js';

const data = () => [{ id: 'a', unread: 2 }, { id: 'b', unread: 0 }, { id: 'c', unread: 1 }];

test('opening an unread conversation removes its badge and lowers the count', async () => {
  const inbox = createInbox(data());
  await inbox.markAsRead('a');
  assert.equal(inbox.isUnread('a'), false);
  assert.equal(inbox.unreadCount(), 1);
});

test('already read or missing conversation leaves count unchanged', async () => {
  const inbox = createInbox(data());
  await inbox.markAsRead('b');
  await inbox.markAsRead('zzz');
  assert.equal(inbox.unreadCount(), 3);
});

test('new message after viewing raises the count again', async () => {
  const inbox = createInbox(data());
  await inbox.markAsRead('a');
  inbox.receive('a');
  assert.equal(inbox.isUnread('a'), true);
  assert.equal(inbox.unreadCount(), 2);
});

test('persistence failure restores the badge', async () => {
  const inbox = createInbox(data(), { persistRead: async () => { throw new Error('x'); } });
  await assert.rejects(inbox.markAsRead('a'));
  assert.equal(inbox.isUnread('a'), true);
  assert.equal(inbox.unreadCount(), 3);
});
