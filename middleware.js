// /middleware.js
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    console.log('=== Middleware ===');
    console.log('Request path:', req.nextUrl.pathname);
    console.log('Token:', req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('=== Authorization Check ===');
        console.log('Token exists:', !!token);
        return !!token;
      }
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/*).*)',
  ],
}