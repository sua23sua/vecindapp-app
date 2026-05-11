import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", req.url));

  // Delete every cookie the browser sent — works regardless of Supabase client issues
  req.cookies.getAll().forEach(({ name }) => {
    response.cookies.set({ name, value: "", maxAge: 0, path: "/" });
  });

  return response;
}
