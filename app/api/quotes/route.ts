import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({ include: { customer: true, package: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(quotes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = await prisma.quote.create({ data: body });
    return NextResponse.json(quote, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
  }
}
