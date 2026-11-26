import { NextResponse } from "next/server";
import { checkPassword, createSession, isAdmin, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { storageMode } from "@/lib/repo";

export async function GET(request) {
  return NextResponse.json({
    authed: isAdmin(request),
    configured: Boolean(process.env.ADMIN_PASSWORD),
    mode: storageMode(),
  });
}

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ authed: true });
  res.cookies.set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ authed: false });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
