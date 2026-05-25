import { NextResponse } from "next/server";

const pricePerKw: Record<string, number> = {
  "on-grid": 85000,
  hybrid: 105000,
  "off-grid": 130000,
};

export async function POST(req: Request) {
  try {
    const { systemType, capacityKw, panelBrand, addBattery } = await req.json();
    const base = (pricePerKw[systemType] || 0) * capacityKw;
    const brandExtra = panelBrand === "Canadian Solar" ? 5000 * capacityKw : 0;
    const battery = addBattery ? 180000 : 0;
    const total = base + brandExtra + battery;
    return NextResponse.json({ totalCost: total });
  } catch {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
