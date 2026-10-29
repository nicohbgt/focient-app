# ADR-003: Cryptographic Authentication, Verified Google OIDC, Persistent Hashed OTPs, and Session Revocation

## Status
**Accepted** (October 2026)

## Context
Early prototypes used simple JWT decoding for Google authentication, in-memory OTP codes logged to stdout, unvalidated secrets with fallback defaults, and lacked explicit server-side session revocation. To meet production standards, the authentication subsystem required a comprehensive security hardening overhaul.

## Decision
1. **Verified Google OpenID Connect (OIDC)**:
   - Completely removed unverified `jwt.decode` calls.
   - Integrated `google-auth-library` (`OAuth2Client.verifyIdToken`) with Google JWKS signature validation, audience verification (`GOOGLE_CLIENT_ID`), expiry enforcement, and email verification flags.
2. **Elimination of Fallback Secrets**:
   - Replaced default strings with mandatory environment validation.
   - In production (`NODE_ENV=production`), the application immediately crashes on boot if `JWT_SECRET` is missing or shorter than 32 characters.
3. **Persistent Hashed OTP Records**:
   - OTP codes are hashed using `HMAC-SHA256` before persistence to the database.
   - Plaintext OTPs are never stored in the database and never logged to stdout or console.
   - Enforced single-use consumption (`isUsed = true`), a strict 5-minute expiration, a 30-second cooldown rate limit between requests, and permanent invalidation after 5 consecutive failed attempts.
4. **Session Expiration, Refresh Token Rotation, and Revocation**:
   - Short-lived Access Tokens (15 minutes) paired with rotating Refresh Tokens (30 days).
   - Sessions are persisted in the `Session` model.
   - User logout immediately marks the session as revoked (`isRevoked = true`), terminating access instantly across all services.
   - Password reset operations revoke all existing user sessions simultaneously.

## Consequences
- **Positive**:
  - Defense against token forgery, replay attacks, credential brute-forcing, and token leakage.
  - Full OWASP and enterprise compliance for user identity management.
- **Negative / Trade-offs**:
  - Local developers must specify `JWT_SECRET` in `.env` files (documented in `local-setup.md`).
