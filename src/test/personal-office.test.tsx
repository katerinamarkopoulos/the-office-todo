import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OfficeBoard } from '@/components/office-board';
afterEach(cleanup);
describe('Personal accounts', () => {
  it('does not import another visitor’s locally stored tasks', () => {
    localStorage.setItem('office-tasks', JSON.stringify([{ id: 'other', text: 'Other visitor private task', done: false }]));
    render(<OfficeBoard initialState={{ tasks: [], notes: [] }}/>);
    expect(screen.queryByText('Other visitor private task')).toBeNull();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    localStorage.clear();
  });
  it('starts a new personal account with no shared notes', () => {
    localStorage.setItem('office-notes', JSON.stringify([{ id: 'other', text: 'Private note', color: 0 }]));
    render(<OfficeBoard initialState={{ tasks: [], notes: [] }}/>);
    expect(screen.queryAllByLabelText('Note text')).toHaveLength(0);
    localStorage.clear();
  });
});