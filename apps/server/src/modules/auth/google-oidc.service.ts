import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { UnauthorizedError } from '../../common/errors.js';
import { securityConfig } from '../../common/config.js';

export interface VerifiedGoogleUser {
  email: string;
  name: string;
  sub: string;
  picture?: string;
  emailVerified: boolean;
}

export interface IGoogleOidcValidator {
  verifyIdToken(idToken: string): Promise<VerifiedGoogleUser>;
}

/**
 * Google OpenID Connect (OIDC) Token Verification Service
 *
 * Implements standard OIDC token validation:
 * - Cryptographically verifies RS256 signature using Google's public JWKS certificates.
 * - Asserts token issuer is accounts.google.com or https://accounts.google.com.
 * - Asserts token audience matches configured Google Client IDs.
 * - Checks expiration timestamp.
 * - Asserts email_verified is true.
 *
 * Eliminates unverified JWT decoding vulnerabilities.
 */
export class GoogleOidcService implements IGoogleOidcValidator {
  private client: OAuth2Client;
  private customValidator?: (idToken: string) => Promise<VerifiedGoogleUser>;

  constructor(customValidator?: (idToken: string) => Promise<VerifiedGoogleUser>) {
    this.client = new OAuth2Client();
    this.customValidator = customValidator;
  }

  /**
   * For testing or dependency injection
   */
  setCustomValidator(validator: (idToken: string) => Promise<VerifiedGoogleUser>): void {
    this.customValidator = validator;
  }

  async verifyIdToken(idToken: string): Promise<VerifiedGoogleUser> {
    if (!idToken || typeof idToken !== 'string' || idToken.trim().length === 0) {
      throw new UnauthorizedError('Google ID token is required');
    }

    if (this.customValidator) {
      return this.customValidator(idToken);
    }

    const audiences = securityConfig.googleClientIds;

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken.trim(),
        audience: audiences.length > 0 ? audiences : undefined,
      });

      const payload: TokenPayload | undefined = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedError('Invalid Google ID token payload');
      }

      if (!payload.email) {
        throw new UnauthorizedError('Google account has no associated email address');
      }

      if (!payload.email_verified) {
        throw new UnauthorizedError(
          'Email Google Anda belum diverifikasi. Mohon verifikasi email Google Anda terlebih dahulu.'
        );
      }

      // Assert issuer is Google OIDC
      const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
      if (!payload.iss || !validIssuers.includes(payload.iss)) {
        throw new UnauthorizedError('Invalid token issuer for Google OpenID Connect');
      }

      return {
        email: payload.email.toLowerCase(),
        name: payload.name || payload.email.split('@')[0],
        sub: payload.sub,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedError(`Google OpenID Connect verification failed: ${message}`);
    }
  }
}

export const googleOidcService = new GoogleOidcService();
