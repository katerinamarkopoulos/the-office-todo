import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/reset-password')({ head: () => pageHead('Todays Office – Reset password', 'Set a new password for your Todays Office account.'), component: Reset });
function Reset() {
  const navigate = useNavigate();
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const recovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    if (recovery) setValid(true);
    supabase.auth.getUser().then(({ data }) => { if (data.user && (recovery || sessionStorage.getItem('office-recovery') === 'yes')) setValid(true); });
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    sessionStorage.removeItem('office-recovery');
    await navigate({ to: '/office', replace: true });
  }
  return <main className="mx-auto max-w-md px-6 py-16"><h1 className="text-3xl">Reset your password</h1>{valid ? <form className="mt-8 space-y-4" onSubmit={submit}><label className="block space-y-2"><span>New password</span><Input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label><Button disabled={busy}>Save password</Button></form> : <p className="mt-6">Open the password reset link in your email.</p>}{message && <p role="alert" className="mt-4">{message}</p>}</main>;
}