import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    debug: process.env.NODE_ENV === 'development' || true, // Keep true for now to debug production
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    const data = await res.json();
                    if (data.success && data.data) {
                        return data.data;
                    }
                    throw new Error(data.error || 'Login failed');
                } catch (e: any) {
                    throw new Error(e.message || 'Login failed');
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role ?? 'user';
                token.provider = account?.provider ?? 'credentials';
                token.picture = user.image ?? token.picture;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).provider = token.provider;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },
    events: {
        async signIn({ user, account }) {
            // Force the 'provider' field to match reality in MongoDB
            if (account && user.id) {
                const client = await clientPromise;
                const db = client.db();
                const provider = account.provider; // 'google' or 'credentials'

                await db.collection('users').updateOne(
                    { email: user.email }, // Use email as a stable key
                    { $set: { provider: provider } }
                );
            }
        },
        async createUser({ user }) {
            // Optional: You can set defaults or cleanup here
            if (user.email && !user.name) {
                const client = await clientPromise;
                const db = client.db();
                await db.collection('users').updateOne(
                    { email: user.email },
                    { $set: { name: user.email.split('@')[0], provider: 'google' } }
                );
            }
        }
    }
});
