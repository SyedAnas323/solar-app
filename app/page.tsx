import { prisma } from "@/lib/prisma";
import LandingClient from "@/components/landing-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LandingPage() {
  let packages: any[] = [];
  let allPackagesForFilters: any[] = [];
  let installedCount = 0;
  let totalQuotes = 0;

  try {
    [packages, allPackagesForFilters, installedCount, totalQuotes] = await prisma.$transaction([
      prisma.package.findMany({
        where: { isActive: true },
        include: { _count: { select: { quotes: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.package.findMany({
        select: { systemType: true, capacity: true, panelBrand: true },
      }),
      prisma.quote.count({ where: { status: "installed" } }),
      prisma.quote.count(),
    ]);
  } catch (error) {
    console.error("Landing page DB fallback:", error);
  }

  const systemTypes = Array.from(new Set(allPackagesForFilters.map((p) => p.systemType).filter(Boolean))).sort();
  const capacities = Array.from(new Set(allPackagesForFilters.map((p) => p.capacity).filter((v) => typeof v === "number"))).sort((a, b) => a - b);
  const panelBrands = Array.from(new Set(allPackagesForFilters.map((p) => p.panelBrand).filter(Boolean))).sort();
  const inverterNames = Array.from(new Set(packages.map((p) => p.inverterMake))).filter(Boolean).sort();

  const mostPopularId = [...packages].sort((a, b) => (b._count?.quotes || 0) - (a._count?.quotes || 0))[0]?.id;

  const inverterDetails = inverterNames.map((name) => {
    const related = packages.filter((p) => p.inverterMake === name);
    const system = Array.from(new Set(related.map((p) => p.systemType))).join(", ") || "Multi-system";
    const minCap = Math.min(...related.map((p) => p.capacity));
    const maxCap = Math.max(...related.map((p) => p.capacity));
    return {
      name,
      system,
      range: `${minCap} - ${maxCap} kW`,
      warranty: "Up to 10 years",
    };
  });

  return (
    <LandingClient
      packages={packages}
      installedCount={installedCount}
      totalQuotes={totalQuotes}
      mostPopularId={mostPopularId}
      inverterDetails={inverterDetails}
      inverterNames={inverterNames}
      systemTypes={systemTypes}
      capacities={capacities}
      panelBrands={panelBrands}
    />
  );
}
