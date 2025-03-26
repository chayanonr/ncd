// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the Session interface so that:
   * - session.user now can include an optional `role` property.
   * - session.vendor and session.accessToken are available.
   */
  interface Session extends DefaultSession {
    user: {
      /** The user's role (if provided) */
      role?: string;
    } & DefaultSession["user"];
    vendor?: {
      id: string;
      name: string;
      first_name: string;
      last_name: string;
      role: string;
      mobile?: string | null;
      address: string;
      username: string;
      enabled: boolean;
      token: string;
      created: string;
      updated: string;
    };
    accessToken?: string;
  }

  /**
   * Extend the User interface for the authorize() callback return value.
   */
  interface User extends DefaultUser {
    token: string;
    vendor: {
      id: string;
      name: string;
      first_name: string;
      last_name: string;
      role: string;
      mobile?: string | null;
      address: string;
      username: string;
      enabled: boolean;
      token: string;
      created: string;
      updated: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    vendor?: NextAuth.User["vendor"];
    accessToken?: string;
  }
}
