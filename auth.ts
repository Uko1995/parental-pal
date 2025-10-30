import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRepository } from "./lib/UserRepository";
import { UserInterface } from "./models/User";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
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

        try {
          const user = await UserRepository.findByEmail(
            credentials.email as string
          );

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await UserRepository.updateUser(user._id!.toString(), {
            lastLoginAt: new Date(),
          });

          return {
            id: user._id!.toString(),
            email: user.userData.user.email,
            name: user.userData.user.name,
            image: user.userData.user.image,
            role: user.role,
            membershipType: user.membershipType,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/", // Redirect to home page after sign out
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth
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
            console.log("New User Data:", newUser);

            existingUser = await UserRepository.createUser(newUser);

            // Send welcome email for new users
            try {
              const emailResponse = await fetch(
                `${process.env.NEXTAUTH_URL}/api/email`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    type: "welcome",
                    to: user.email,
                    userName: user.name || "New Parent",
                  }),
                }
              );

              if (emailResponse.ok) {
                console.log(
                  "✅ Welcome email sent successfully to:",
                  user.email
                );
              } else {
                console.error(
                  "❌ Failed to send welcome email:",
                  await emailResponse.text()
                );
              }
            } catch (emailError) {
              console.error("❌ Error sending welcome email:", emailError);
            }
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
          console.error("Error during Google sign in:", error);
          return false;
        }
      }

      // Handle credentials login (already processed in authorize)
      if (account?.provider === "credentials") {
        return true;
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
