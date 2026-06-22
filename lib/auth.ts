import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const nextAuthSecret = process.env.NEXTAUTH_SECRET || "solarpro-dev-secret-change-me";
import { verifyAdminCredentials } from "@/lib/admin-credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const admin = await verifyAdminCredentials(credentials.email, credentials.password);
        return admin ? { id: admin.id, email: admin.email, name: "Solar Admin" } : null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: nextAuthSecret,
};
