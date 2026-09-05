# FinTrack Security Architecture & Threat Model

## 1. Core Principles: Fail-Closed Security
FinTrack treats security and financial auditability as non-negotiable.

### 1.1 Elimination of Fail-Open Fallbacks
- All legacy mock fallback behavior (e.g. falling back to an in-memory `Demo User` when a database connection fails or credentials are invalid) has been completely removed.
- Unauthenticated or unauthorized requests fail closed with strict 401 Unauthorized or 403 Forbidden responses.

### 1.2 Cryptographic Token Integrity
- JWT authentication tokens are signed with high-entropy keys.
- Token expiration is enforced.
- Server rejects tokens with malformed payloads or missing user identities.

### 1.3 Server-Side Google OAuth Verification
- Client-submitted Google profile parameters (`email`, `name`, `picture`) are never accepted as proof of identity.
- Every Google login verifies the cryptographically signed `id_token` via Google's `OAuth2Client.verifyIdToken()`, validating audience (`aud`), issuer (`iss`), expiry (`exp`), and email verification flags (`email_verified`).

---

## 2. Resource Ownership & Authorization
Every mutation and query strictly scopes records to the authenticated tenant:
```sql
SELECT * FROM accounts WHERE id = :id AND user_id = :authenticated_user_id;
UPDATE transactions SET ... WHERE id = :id AND user_id = :authenticated_user_id;
```
Client payloads can never override `userId`, `accountOwner`, or timestamps.

---

## 3. Defense-in-Depth Protections
- **Helmet**: Disables MIME sniffing, sets X-Frame-Options to DENY, enables XSS filter, and configures Cross-Origin Resource Policies.
- **Rate Limiting**: Authentication endpoints are rate-limited to 100 requests per 15-minute window (`express-rate-limit`) to prevent brute-force attacks.
- **Input Validation**: All request bodies are strictly validated against typed Zod schemas. Unknown or unwhitelisted mutation keys are rejected before reaching database layers.
- **Audit Logging**: All critical mutations (account creation, transaction deletion, goal deposits, statement imports) generate immutable records in the `audit_events` table with IP addresses and timestamps.
