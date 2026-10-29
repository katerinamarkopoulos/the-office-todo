import { createFileRoute } from '@tanstack/react-router';
import { AuthScreen } from '@/components/auth-screen';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/')({ head: () => pageHead('Todays Office – Create your account', 'Create your personal Todays Office profile.'), component: () => <AuthScreen /> });