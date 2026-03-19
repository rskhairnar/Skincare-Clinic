import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export const authMiddleware = (handler, allowedRoles = []) => {
  return async (req, context) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    req.user = decoded;
    return handler(req, context);
  };
};
