import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import _Institute from "@/models/Institute";
import { verifyPassword, hashPassword } from "@/lib/auth-utils";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        // Validate reCAPTCHA Server Side (skip for local dev testing if not set or in dev mode)
        const isDev =
          process.env.NEXT_PUBLIC_DISABLE_RECAPTCHA === "true" ||
          process.env.NODE_ENV === "development";
        const secretKey =
          process.env.RECAPCTHA_SERVER_SECRECT ||
          process.env.RECAPTCHA_SERVER_SECRET;
        if (!isDev && secretKey) {
          if (!credentials?.recaptchaToken) {
            throw new Error("Please complete the reCAPTCHA verification");
          }
          try {
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${credentials.recaptchaToken}`;
            const verifyRes = await fetch(verifyUrl, { method: "POST" });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(
                "reCAPTCHA verification failed. Please try again.",
              );
            }
          } catch (err) {
            throw new Error(err.message || "Failed to verify reCAPTCHA");
          }
        }

        await dbConnect();
        const email = credentials.email.toLowerCase();

        // Check for super-admin first
        if (email === process.env.ADMIN_EMAIL?.toLowerCase()) {
          let admin = await User.findOne({ email });
          if (!admin) {
            // Seed super-admin if they don't exist
            admin = await User.create({
              name: "Super Admin",
              email,
              password: hashPassword(credentials.password),
              role: "super-admin",
              isApproved: true,
            });
          }
          const passwordMatches = verifyPassword(
            credentials.password,
            admin.password,
          );
          if (!passwordMatches) {
            throw new Error("Invalid admin credentials");
          }
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
            requiresPasswordUpdate: admin.requiresPasswordUpdate,
          };
        }

        const user = await User.findOne({ email }).populate("institute");
        if (!user) {
          throw new Error("No user found with this email");
        }

        // For college-admin, verify institute status
        if (user.role === "college-admin" && user.institute) {
          if (user.institute.status === "pending") {
            throw new Error(
              "Your institute setup request is pending approval by the Super Admin.",
            );
          }
          if (user.institute.status === "rejected") {
            throw new Error(
              "Your institute setup request was rejected. Please contact support.",
            );
          }
        }

        // Verify password
        const isValid = verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          requiresPasswordUpdate: user.requiresPasswordUpdate,
          department: user.department,
          instituteId: user.institute?._id?.toString(),
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        await dbConnect();
        const email = profile.email.toLowerCase();

        // If Google login is by the super admin
        if (email === process.env.ADMIN_EMAIL?.toLowerCase()) {
          let admin = await User.findOne({ email });
          if (!admin) {
            admin = await User.create({
              name: profile.name,
              email,
              role: "super-admin",
              isApproved: true,
            });
          }
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
            requiresPasswordUpdate: admin.requiresPasswordUpdate,
          };
        }

        const user = await User.findOne({ email }).populate("institute");
        if (!user) {
          // Prevent sign-in for unregistered users
          throw new Error(
            "This email is not registered under any active college in the UniVerse platform.",
          );
        }

        if (user.role === "college-admin" && user.institute) {
          if (user.institute.status === "pending") {
            throw new Error(
              "Your institute setup request is pending approval.",
            );
          }
          if (user.institute.status === "rejected") {
            throw new Error("Your institute setup request was rejected.");
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          requiresPasswordUpdate: user.requiresPasswordUpdate,
          department: user.department,
          phone: user.phone,
          instituteId: user.institute?._id?.toString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.requiresPasswordUpdate = user.requiresPasswordUpdate;
        token.department = user.department;
        token.instituteId = user.instituteId;
        token.phone = user.phone;
      }

      if (trigger === "update" && session) {
        if (session.requiresPasswordUpdate !== undefined) {
          token.requiresPasswordUpdate = session.requiresPasswordUpdate;
        }
        if (session.name !== undefined) {
          token.name = session.name;
        }
        if (session.phone !== undefined) {
          token.phone = session.phone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.requiresPasswordUpdate = token.requiresPasswordUpdate;
        session.user.department = token.department;
        session.user.instituteId = token.instituteId;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
