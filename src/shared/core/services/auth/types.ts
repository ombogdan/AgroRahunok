export type IdentityProvider = 'google' | 'apple';

export type AuthSession =
  | {kind: 'guest'}
  | {kind: 'authenticated'; userId: string; displayName?: string; email?: string};

export interface AuthGateway {
  restoreSession(): Promise<AuthSession>;
  signIn(provider: IdentityProvider): Promise<AuthSession>;
  signOut(): Promise<void>;
}
