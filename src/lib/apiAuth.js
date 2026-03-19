import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export function getAuthUser(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req) {
  const user = getAuthUser(req);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export function requireRole(req, roles) {
  const { user, error } = requireAuth(req);
  if (error) return { user: null, error };

  if (!roles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, error: null };
}
