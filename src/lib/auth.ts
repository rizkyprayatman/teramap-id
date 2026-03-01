import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
type Role = "SUPER_ADMIN" | "ORGANIZATION_OWNER" | "ADMIN_INSTANSI" | "STAFF" | "VIEWER";

declare module "next-auth" {
  interface User {
    role: Role;
    organizationId: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      organizationId: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { organization: true },
        });

        if (!user || !user.isActive) {
          return null;
        }

        // Check email verification
        if (!user.emailVerified) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Check if organization is suspended or not active
        if (user.organization?.isSuspended) {
          return null;
        }
        if (user.organization && user.organization.orgStatus !== "ACTIVE") {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
