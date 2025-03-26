import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const session = req.nextauth.token;

    if (session) {
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/overview", req.url));
      }
      return NextResponse.next();
    } else {
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/overview/:path*", "/"],
};