import { createFileRoute } from '@tanstack/react-router';
import { AuthScreen } from '@/components/auth-screen';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/auth')({ head: () => pageHead('Todays Office – Sign in', 'Sign in to your private tasks and notes.'), component: () => <AuthScreen startMode="signin" /> });