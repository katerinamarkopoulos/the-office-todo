import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import '@lovable.dev/cloud-auth-js/styles.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileName } from '@/lib/office-data';
import { AvatarPicker } from '@/components/avatar-picker';
import michael from '@/assets/michael-face.png.asset.json';
import logo from '@/assets/office-logo.png.asset.json';

export function AuthScreen({ startMode = 'signup' }: { startMode?: 'signup' | 'signin' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signup' | 'signin' | 'forgot'>(startMode);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active && data.user) navigate({ to: '/office', replace: true }); });
    return () => { active = false; };
  }, [navigate]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage(''); setBusy(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        const parsed = profileName.safeParse(name);
        if (!parsed.success) throw new Error('Enter your name.');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin, data: { name: parsed.data, avatar_id: avatar } } });
        if (error) throw error;
        if (data.session) await navigate({ to: '/office' });
        else setMessage('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await navigate({ to: '/office' });
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setMessage('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: '/office' });
    } catch { setMessage('Sign-in could not be completed. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-background">
    <header className="flex items-center justify-between gap-4 bg-secondary px-4 py-4 md:px-6">
      <div className="flex items-center gap-3"><img src={michael.url} alt="Michael Scott" className="h-14 w-20 object-contain md:h-20 md:w-28"/><h1 className="text-2xl md:text-3xl">Todays Office</h1></div>
      <img src={logo.url} alt="The Office" className="h-12 w-auto md:h-16"/>
    </header>
    <main className="mx-auto max-w-md px-6 py-10 md:py-16">
      <p className="mb-6 text-sm text-primary">DUNDER MIFFLIN · PERSONNEL</p>
      <h2 className="text-3xl">{mode === 'signup' ? 'Your first day.' : mode === 'signin' ? 'Welcome back.' : 'Forgot your password?'}</h2>
      <form onSubmit={submit} className="mt-8 space-y-5">
        {mode === 'signup' && <label className="block space-y-2"><span>Your name</span><Input autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)}/></label>}
        {mode === 'signup' && <AvatarPicker value={avatar} onChange={setAvatar}/>}
        <label className="block space-y-2"><span>Email</span><Input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/></label>
        {mode !== 'forgot' && <label className="block space-y-2"><span>Password</span><Input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)}/></label>}
        {message && <p role="status" className="text-sm break-words">{message}</p>}
        <Button disabled={busy} type="submit" className="w-full">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'signin' ? 'Sign in' : 'Send reset link'}</Button>
      </form>
      {mode !== 'forgot' && <div className="mt-6 space-y-3 border-t pt-6">
        <Button variant="outline" className="w-full" disabled={busy} onClick={() => social('google')}>Continue with Google</Button>
        <Button className="lovable-auth-button w-full" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button>
      </div>}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="link" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</Button>
        {mode === 'signin' && <Button variant="link" onClick={() => { setMode('forgot'); setMessage(''); }}>Forgot password?</Button>}
      </div>
    </main>
  </div>;
}