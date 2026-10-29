import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PasswordInput } from '@/components/password-input';
afterEach(cleanup);
it('shows and hides the same password without submitting the form', () => {
  const submit = vi.fn();
  render(<form onSubmit={submit}><PasswordInput aria-label="Password" defaultValue="TestPassword123" /></form>);
  const field = screen.getByLabelText('Password');
  expect(field).toHaveAttribute('type', 'password');
  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(field).toHaveAttribute('type', 'text');
  expect(field).toHaveValue('TestPassword123');
  fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(field).toHaveAttribute('type', 'password');
  expect(submit).not.toHaveBeenCalled();
});