import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findAdminCredential, saveAdminCredentials } from "@/lib/admin-credentials";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await findAdminCredential();
  return NextResponse.json({
    email: admin?.email || process.env.ADMIN_EMAIL || "admin@solarpro.com",
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const admin = await saveAdminCredentials(email, password);
  if (!admin) {
    return NextResponse.json({ error: "Admin credentials could not be saved right now" }, { status: 503 });
  }
  return NextResponse.json({ email: admin.email });
}
