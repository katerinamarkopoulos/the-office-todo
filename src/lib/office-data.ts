import { z } from 'zod';
import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import pam from '@/assets/avatar-pam.png.asset.json';
import dwight from '@/assets/avatar-dwight.png.asset.json';
import dundie from '@/assets/avatar-dundie.png.asset.json';
import jelly from '@/assets/avatar-jelly.png.asset.json';
import jim from '@/assets/avatar-jim.png.asset.json';
import michael from '@/assets/avatar-michael.png.asset.json';

export const taskSchema = z.object({ id: z.string(), text: z.string(), day: z.string().optional(), week: z.number().optional(), done: z.boolean() });
export const noteSchema = z.object({ id: z.string(), text: z.string(), color: z.number().int().min(0).max(2) });
export const officeSchema = z.object({ tasks: z.array(taskSchema), notes: z.array(noteSchema) });
export type OfficeState = z.infer<typeof officeSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Note = z.infer<typeof noteSchema>;
export const profileName = z.string().trim().min(1, 'Enter your name.').max(100);
export const avatarChoices = [
  { id: 'pam', name: 'Pam', url: pam.url },
  { id: 'dwight', name: 'Dwight', url: dwight.url },
  { id: 'dundie', name: 'Dundie Award', url: dundie.url },
  { id: 'jelly', name: 'Stapler in jelly', url: jelly.url },
  { id: 'jim', name: 'Jim', url: jim.url },
  { id: 'michael', name: 'Michael', url: michael.url },
];

export const officeQuery = queryOptions({
  queryKey: ['personal-office'],
  queryFn: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Please sign in again.');
    const [profile, office] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('office_state').select('tasks,notes').eq('user_id', user.id).maybeSingle(),
    ]);
    if (profile.error || office.error) throw new Error('Your office could not be loaded. Please retry.');
    return { userId: user.id, profile: profile.data, state: officeSchema.parse(office.data ?? { tasks: [], notes: [] }) };
  },
});

export async function saveOffice(userId: string, state: OfficeState) {
  const validated = officeSchema.parse(state);
  const { error } = await supabase.from('office_state').upsert({ user_id: userId, ...validated, updated_at: new Date().toISOString() });
  if (error) throw new Error('Changes could not be saved.');
}