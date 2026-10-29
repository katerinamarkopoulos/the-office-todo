import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { avatarChoices } from '@/lib/office-data';

export function AvatarPicker({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  return <fieldset><legend className="mb-3">Profile picture</legend>
    <div className="grid grid-cols-3 gap-3">
      {avatarChoices.map(a => <Button key={a.id} type="button" variant={value === a.id ? 'secondary' : 'outline'} aria-label={a.name} aria-pressed={value === a.id} title={a.name} onClick={() => onChange(a.id)} className="relative h-24 w-full rounded-md p-2">
        <img src={a.url} alt="" className="h-full w-full object-contain"/>
        {value === a.id && <Check className="absolute right-1 top-1 rounded-full bg-primary text-primary-foreground"/>}
      </Button>)}
    </div>
  </fieldset>;
}