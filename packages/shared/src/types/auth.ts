import type { AuthProvider, UserRole, UserStatus } from "../constants/domain.js";

/** The account as the client may see it. Never includes password hashes or tokens. */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  emailVerified: boolean;
  avatarUrl: string | null;
  roles: UserRole[];
  providers: AuthProvider[];
  createdAt: string;
}
