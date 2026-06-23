import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logError } from "./app/lib/logger"
import { updateSession } from "./utils/supabase/middleware"

export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (error) {
        logError('middleware.session_update.failed', error, {
            pathname: request.nextUrl.pathname,
            protectedRoute: request.nextUrl.pathname.startsWith("/protected"),
        })
        
        // Fail closed for protected routes, while public routes remain available.
        if (request.nextUrl.pathname.startsWith("/protected")) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
        return NextResponse.next()
    }
}


export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - anything with `_next/static` (static files)
         * - anything with `_next/image` (image optimization files)
         * - `favicon.ico` (favicon file)
         * - `api` (API routes)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
