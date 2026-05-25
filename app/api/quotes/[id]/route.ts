import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.quote.update({ where: { id: params.id }, data: { status: body.status } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}
