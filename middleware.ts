import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { signToken, verifyToken } from '@/lib/auth/session';

// const protectedRoutes = '/dashboard';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const sessionCookie = request.cookies.get('session');
//   const isProtectedRoute = pathname.startsWith(protectedRoutes);

//   if (isProtectedRoute && !sessionCookie) {
//     return NextResponse.redirect(new URL('/sign-in', request.url));
//   }

//   let res = NextResponse.next();

//   if (sessionCookie && request.method === 'GET') {
//     try {
//       const parsed = await verifyToken(sessionCookie.value);
//       const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

//       res.cookies.set({
//         name: 'session',
//         value: await signToken({
//           ...parsed,
//           expires: expiresInOneDay.toISOString()
//         }),
//         httpOnly: true,
//         secure: true,
//         sameSite: 'lax',
//         expires: expiresInOneDay
//       });
//     } catch (error) {
//       console.error('Error updating session:', error);
//       res.cookies.delete('session');
//       if (isProtectedRoute) {
//         return NextResponse.redirect(new URL('/sign-in', request.url));
//       }
//     }
//   }

//   return res;
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
