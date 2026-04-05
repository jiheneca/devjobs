// proxy.js
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const { pathname } = req.nextUrl

  // Public routes — always allow
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/role-selection") ||
    pathname.startsWith("/complete-profile") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next()
  }

  // Not logged in — redirect to sign in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/developer/:path*", "/company/:path*"],
}