// proxy.js
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/role-selection") ||
    pathname.startsWith("/complete-profile") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/developer/:path*", "/company/:path*"],
}