import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export const authService = {
  /**
   * Request a password-reset email. Always resolves (server returns 204 regardless of email existence)
   * to prevent account enumeration — the UI must show the same confirmation in all cases.
   */
  forgotPassword: (email: string) =>
    api<void>("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    }),

  /**
   * Redeem a reset token + new password. On success returns a fresh TokenResponse — caller should
   * save tokens via `setSession` from AuthContext and redirect to "/".
   */
  resetPassword: (token: string, newPassword: string) =>
    api<TokenResponse>("/auth/reset-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ token, newPassword }),
    }),

  /**
   * Mark the email as verified. Returns 204; after success, call `/auth/refresh` to obtain a
   * TokenResponse with the populated `emailVerifiedAt` in the user payload.
   */
  verifyEmail: (token: string) =>
    api<void>("/auth/verify-email", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ token }),
    }),

  refresh: (refreshToken: string) =>
    api<TokenResponse>("/auth/refresh", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ refreshToken }),
    }),
};
