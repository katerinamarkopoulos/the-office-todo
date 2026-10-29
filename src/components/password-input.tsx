import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <Input {...props} type={visible ? 'text' : 'password'} className="pr-12"/>
    <Button type="button" variant="ghost" size="icon" title={visible ? 'Hide password' : 'Show password'} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(v => !v)} className="absolute right-0 top-0 h-9 w-10">
      {visible ? <EyeOff /> : <Eye />}
    </Button>
  </div>;
}