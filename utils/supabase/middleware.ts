import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers
        }
    });
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
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
    )
    
    // Get the user session
    // This will also update the session cookie if it has changed

    const user = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
        // If the user is not authenticated, redirect to the login page
        return NextResponse.redirect(new URL(`/login`, request.url));
    }

    if(request.nextUrl.pathname === "/" && !user.error) {
        // If the user is authenticated and trying to access the home page, redirect to the protected page
        return NextResponse.redirect(new URL(`/protected`, request.url));
    }

    return supabaseResponse;
}

