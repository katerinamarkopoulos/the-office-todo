import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState, type FormEvent } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { OfficeBoard } from '@/components/office-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { officeQuery, saveOffice, profileName, avatarChoices, type OfficeState } from '@/lib/office-data';
import { pageHead } from '@/lib/page-head';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute('/_authenticated/office')({
  head: () => pageHead('Todays Office – Your office', 'Your personal tasks, notes and daily Michael Scott wisdom.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(officeQuery),
  component: Office,
});
function Office() {
  const { data } = useSuspenseQuery(officeQuery);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState(data.profile.name);
  const [avatar, setAvatar] = useState(data.profile.avatar_id);
  const [open, setOpen] = useState(!data.profile.name.trim());
  const [saveStatus, setSaveStatus] = useState('');
  const [profileError, setProfileError] = useState('');
  const [busy, setBusy] = useState(false);
  const queue = useRef(Promise.resolve());
  const latest = useRef(data.state);
  const failed = useRef(false);
  const persist = useCallback((state: OfficeState) => {
    latest.current = state;
    setSaveStatus('Saving…');
    queue.current = queue.current.then(async () => {
      try {
        await saveOffice(data.userId, state);
        failed.current = false;
        queryClient.setQueryData(officeQuery.queryKey, (old: typeof data | undefined) => old ? { ...old, state } : old);
        setSaveStatus('Saved');
      } catch { failed.current = true; setSaveStatus('Not saved — please retry'); }
    });
  }, [data.userId, queryClient]);
  async function signOut() {
    setBusy(true);
    await queue.current;
    if (failed.current) { setBusy(false); return; }
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: '/auth', replace: true });
  }
  async function updateProfile(e: FormEvent) {
    e.preventDefault(); setProfileError('');
    const parsed = profileName.safeParse(name);
    if (!parsed.success) { setProfileError('Enter your name.'); return; }
    const { error } = await supabase.from('profiles').update({ name: parsed.data, avatar_id: avatar }).eq('id', data.userId);
    if (error) { setProfileError('Profile could not be saved. Please retry.'); return; }
    await queryClient.invalidateQueries({ queryKey: officeQuery.queryKey }); setOpen(false);
  }
  const chosen = avatarChoices.find(a => a.id === data.profile.avatar_id);
  const account = <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
    <span role="status" className="text-xs text-muted-foreground">{saveStatus}</span>
    {saveStatus.startsWith('Not saved') && <Button variant="outline" onClick={() => persist(latest.current)}>Retry</Button>}
    <Dialog open={open} onOpenChange={next => { if (data.profile.name.trim()) setOpen(next); }}>
      <DialogTrigger asChild><Button variant="ghost" className="max-w-full"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">{chosen ? <img src={chosen.url} alt="" className="h-8 w-8 rounded-full object-cover"/> : data.profile.name.slice(0, 2).toUpperCase() || <UserRound />}</span><span className="truncate">{data.profile.name || 'Your profile'}</span></Button></DialogTrigger>
      <DialogContent><DialogHeader><DialogTitle>Your profile</DialogTitle></DialogHeader><form onSubmit={updateProfile} className="space-y-5"><label className="block space-y-2"><span>Your name</span><Input required maxLength={100} value={name} onChange={e => setName(e.target.value)}/></label>{avatarChoices.length > 0 && <fieldset><legend className="mb-3">Profile picture</legend><div className="flex flex-wrap gap-3">{avatarChoices.map(a => <Button key={a.id} type="button" variant={avatar === a.id ? 'secondary' : 'outline'} size="icon" aria-label={a.name} aria-pressed={avatar === a.id} onClick={() => setAvatar(a.id)}><img src={a.url} alt="" className="h-8 w-8 rounded-full object-cover"/></Button>)}</div></fieldset>}{profileError && <p role="alert">{profileError}</p>}<Button type="submit">Save profile</Button></form></DialogContent>
    </Dialog>
    <Button variant="ghost" size="icon" title="Sign out" aria-label="Sign out" disabled={busy} onClick={signOut}><LogOut /></Button>
  </div>;
  return <OfficeBoard key={data.userId} initialState={data.state} onChange={persist} account={account}/>;
}