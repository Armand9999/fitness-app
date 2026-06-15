import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/app/lib/database.types";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers
        }
    });
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
                    try {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options ))
                    } catch (error) {
                        console.error("Error setting cookies:", error);
                    }
                },
            }
        }
    ) as SupabaseClient<Database>
    
    const requiresAuthentication = request.nextUrl.pathname.startsWith("/protected")
    const redirectsAuthenticatedUser = request.nextUrl.pathname === "/"

    // Public routes do not need a remote auth check. This keeps them available
    // during transient Supabase outages and makes public journeys deterministic.
    if (!requiresAuthentication && !redirectsAuthenticatedUser) {
        return supabaseResponse
    }

    const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
        name.startsWith("sb-") && name.includes("auth-token")
    )
    if (redirectsAuthenticatedUser && !hasAuthCookie) {
        return supabaseResponse
    }

    const user = await supabase.auth.getUser();

    if (requiresAuthentication && user.error) {
        // If the user is not authenticated, redirect to the login page
        return NextResponse.redirect(new URL(`/login`, request.url));
    }

    if(redirectsAuthenticatedUser && !user.error) {
        // If the user is authenticated and trying to access the home page, redirect to the protected page
        return NextResponse.redirect(new URL(`/protected`, request.url));
    }

    return supabaseResponse;
}

