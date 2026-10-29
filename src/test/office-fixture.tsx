import { OfficeBoard } from '@/components/office-board';
import type { OfficeState } from '@/lib/office-data';
export function TestOffice() {
  const now = new Date();
  const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const seed: OfficeState = {
    tasks: [{ id: 'a', text: 'Presentation med Micheal', day: day(now), done: false }],
    notes: [
      { id: 'n1', text: 'Remember to buy Milk for Coffe', color: 0 },
      { id: 'n2', text: "Bake cake for Pam's Birthday party at the office", color: 1 },
      { id: 'n3', text: 'Third note', color: 2 }, { id: 'n4', text: 'Fourth note', color: 0 },
    ],
  };
  const tasks = localStorage.getItem('office-tasks');
  if (tasks) seed.tasks = JSON.parse(tasks);
  return <OfficeBoard initialState={seed}/>;
}