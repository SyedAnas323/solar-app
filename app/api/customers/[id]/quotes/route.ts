import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const quotes = await prisma.quote.findMany({ where: { customerId: params.id }, include: { package: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(quotes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch customer quotes" }, { status: 500 });
  }
}
