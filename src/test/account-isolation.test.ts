import { describe, it, expect } from 'vitest';

const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
describe.skipIf(!url || !key)('Cloud account isolation', () => {
  it('keeps tasks and notes private and rejects writes to another account', async () => {
    if (!url || !key) throw new Error('Cloud test environment missing');
    const admin = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
    const ids: string[] = [];
    const tokens: string[] = [];
    try {
      for (const name of ['Isolation A', 'Isolation B']) {
        const email = `isolation-${crypto.randomUUID()}@lovable.dev`;
        const password = `${crypto.randomUUID()}Aa!9`;
        const created = await fetch(`${url}/auth/v1/admin/users`, { method: 'POST', headers: admin, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }) });
        expect(created.ok).toBe(true);
        ids.push((await created.json()).id);
        const login = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: 'POST', headers: admin, body: JSON.stringify({ email, password }) });
        expect(login.ok).toBe(true);
        tokens.push((await login.json()).access_token);
      }
      const userHeaders = (token: string | undefined) => {
        if (!token) throw new Error('Test session missing');
        return { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      };
      const state = { user_id: ids[0], tasks: [{ id: 'a', text: 'Private task', done: false }], notes: [{ id: 'n', text: 'Private note', color: 0 }] };
      const saved = await fetch(`${url}/rest/v1/office_state`, { method: 'POST', headers: userHeaders(tokens[0]), body: JSON.stringify(state) });
      expect(saved.ok).toBe(true);
      const ownerRead = await fetch(`${url}/rest/v1/office_state?select=tasks,notes`, { headers: userHeaders(tokens[0]) });
      expect(await ownerRead.json()).toEqual([{ tasks: state.tasks, notes: state.notes }]);
      const otherRead = await fetch(`${url}/rest/v1/office_state?select=tasks,notes`, { headers: userHeaders(tokens[1]) });
      expect(await otherRead.json()).toEqual([]);
      const forbiddenWrite = await fetch(`${url}/rest/v1/office_state`, { method: 'POST', headers: { ...userHeaders(tokens[1]), Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify(state) });
      expect(forbiddenWrite.ok).toBe(false);
    } finally {
      for (const id of ids) await fetch(`${url}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: admin });
    }
  }, 30000);
});