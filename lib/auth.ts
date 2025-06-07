import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Generate a fallback secret if NEXTAUTH_SECRET is not set
const generateFallbackSecret = () => {
  console.warn(
    "WARNING: NEXTAUTH_SECRET is not set. Using a fallback secret. This is NOT secure for production environments.",
  )
  return "INSECURE_FALLBACK_SECRET_DO_NOT_USE_IN_PRODUCTION" + Date.now().toString()
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real app, you would verify against your database
        if (credentials?.email === "thisbrycedavis@gmail.com" && credentials?.password === "password") {
          return {
            id: "1",
            name: "thisbrycedavis",
            email: "thisbrycedavis@gmail.com",
            role: "professional",
          }
        }
        return null
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  // Use environment variable or fallback for development
  secret: process.env.NEXTAUTH_SECRET || generateFallbackSecret(),
  jwt: {
    // Use environment variable or fallback for development
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || generateFallbackSecret(),
  },
}
