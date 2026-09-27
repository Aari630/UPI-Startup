import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Ensure this exact string matches the cookie name you set during signup
  const session = request.cookies.get("merchant-session")?.value;
  const { pathname, searchParams } = request.nextUrl;

  // 1. Protect the dashboard: No session? Bounce to the signup parameter.
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/?category=signup", request.url));
  }

  // 2. Prevent logged-in users from seeing the login/signup screens
  const isAuthPage = pathname === "/" && 
    (searchParams.get("category") === "login" || searchParams.get("category") === "signup");

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // We only need to run this on the root and the dashboard
  matcher: ["/", "/dashboard/:path*"],
};