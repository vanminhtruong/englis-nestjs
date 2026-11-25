import { AuthService } from './auth.service';
import { AuthHashService } from './auth-hash.service';

describe('Authenticated password change', () => {
  const hash = new AuthHashService();
  let stored: string;
  let service: AuthService;
  let replacePassword: jest.Mock;
  beforeEach(async () => {
    stored = await hash.hashPassword('old-password');
    replacePassword = jest.fn(async (_id, previous, next) => {
      if (previous !== stored) return false;
      stored = next;
      return true;
    });
    const repo = { findById: jest.fn(async () => ({ password: stored })), replacePassword };
    service = new AuthService(repo as any, hash, {} as any, {} as any, {} as any);
  });
  it('verifies the old password and stores only a new hash', async () => {
    await expect(service.changePassword('user', { currentPassword: 'old-password', newPassword: 'new-password' })).resolves.toEqual({ success: true });
    expect(await hash.comparePassword('new-password', stored)).toBe(true);
    expect(await hash.comparePassword('old-password', stored)).toBe(false);
    expect(stored).not.toBe('new-password');
  });
  it('rejects incorrect current password without modifying storage', async () => {
    await expect(service.changePassword('user', { currentPassword: 'incorrect', newPassword: 'new-password' })).rejects.toThrow('INCORRECT_PASSWORD');
    expect(replacePassword).not.toHaveBeenCalled();
  });
  it('rejects reuse', async () => {
    await expect(service.changePassword('user', { currentPassword: 'old-password', newPassword: 'old-password' })).rejects.toThrow('SAME_PASSWORD');
    expect(replacePassword).not.toHaveBeenCalled();
  });
  it('requires email recovery for accounts without a password', async () => {
    stored = '';
    await expect(service.changePassword('user', { currentPassword: 'anything', newPassword: 'new-password' })).rejects.toThrow('NO_PASSWORD');
    expect(replacePassword).not.toHaveBeenCalled();
  });
  it('rejects bcrypt truncation', async () => {
    await expect(service.changePassword('user', { currentPassword: 'old-password', newPassword: '界'.repeat(25) })).rejects.toThrow('PASSWORD_TOO_LONG');
    expect(replacePassword).not.toHaveBeenCalled();
  });
  it('rejects concurrent changes', async () => {
    replacePassword.mockResolvedValueOnce(false);
    await expect(service.changePassword('user', { currentPassword: 'old-password', newPassword: 'new-password' })).rejects.toThrow('PASSWORD_CHANGED');
  });
});
