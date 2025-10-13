import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { UserRepository } from "./lib/UserRepository";
import { UserInterface } from "./models/User";

declare module "next-auth" {
  interface User {
    role?: string;
    membershipType?: string;
    isActive?: boolean;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      membershipType?: string;
      isActive?: boolean;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists
          let existingUser = await UserRepository.findByEmail(user.email);

          if (!existingUser) {
            // Create new user
            const newUser: Omit<
              UserInterface,
              "_id" | "createdAt" | "updatedAt"
            > = {
              userData: {
                expiresAt: new Date(
                  Date.now() + 10 * 24 * 60 * 60 * 1000
                ).toISOString(),
                user: {
                  name: user.name || null,
                  email: user.email || null,
                  image: user.image || null,
                },
              },
              googleId: account.providerAccountId,
              role: "parent", // Default role
              isActive: true,
              lastLoginAt: new Date(),
              membershipType: "basic",
            };

            existingUser = await UserRepository.createUser(newUser);
          } else {
            // Update last login
            await UserRepository.updateUser(existingUser._id!.toString(), {
              lastLoginAt: new Date(),
              userData: {
                expiresAt: new Date().toISOString(),
                user: {
                  image: user.image || null,
                  name: user.name || null,
                  email: user.email || null,
                },
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          const dbUser = await UserRepository.findByEmail(session.user.email);

          if (dbUser) {
            session.user.id = dbUser._id!.toString();
            session.user.role = dbUser.role;
            session.user.membershipType = dbUser.membershipType;
            session.user.isActive = dbUser.isActive;
          }
        } catch (error) {
          console.error("Error fetching user in session:", error);
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.googleId = account.providerAccountId;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
  },
});
