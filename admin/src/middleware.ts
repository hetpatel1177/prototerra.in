import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/login",
    },
})

export const config = {
    // Protect everything except /login and NextAuth API routes
    matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
