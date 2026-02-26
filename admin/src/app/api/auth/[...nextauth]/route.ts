import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Admin Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (!adminEmail || !adminPassword) {
                    throw new Error('Admin credentials not configured.');
                }

                if (
                    credentials?.email === adminEmail &&
                    credentials?.password === adminPassword
                ) {
                    return { id: '1', name: 'Admin', email: adminEmail, role: 'admin' };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 8 * 60 * 60, // 8 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = (user as any).role;
            return token;
        },
        async session({ session, token }) {
            if (session.user) (session.user as any).role = token.role;
            return session;
        },
        async redirect({ url, baseUrl }) {
            // After sign-out NextAuth redirects to baseUrl (root).
            // Catch that and send to /login instead.
            if (url === baseUrl || url === `${baseUrl}/`) {
                return `${baseUrl}/login`;
            }
            // For sign-in and other redirects, allow same-origin URLs through.
            if (url.startsWith(baseUrl)) return url;
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
