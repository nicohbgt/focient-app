/**
 * FoCient Auth Client
 * Hybrid Authentication (Google OAuth 2.0 + Manual Email JWT session)
 */

export interface UserSession {
  id: string;
  email: string;
  name: string;
  workHourStart: string;
  workHourEnd: string;
  dailyCapacityMinutes: number;
}

const TOKEN_KEY = 'focient_token';
const USER_KEY = 'focient_user';

export const authClient = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(token: string, user: UserSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as UserSession;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  getGoogleOAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const redirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/callback`
      : 'http://localhost:3000/callback';
    const scope = encodeURIComponent('openid email profile');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  },
};
