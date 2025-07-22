import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from "./utils/supabase/middleware"

export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (error) {
        console.error('Session update error:', error)
        
        // Return the original request to continue the middleware chain
        // This allows the application to function even if session update fails
        return request.nextUrl ? NextResponse.redirect(request.nextUrl) : NextResponse.next()
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
