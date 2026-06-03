import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function AnalyticsPage() {
  let quotes: any[] = [];
  let customers = 0;
  let packages = 0;

  try {
    [quotes, customers, packages] = await prisma.$transaction([
      prisma.quote.findMany({ include: { package: true } }),
      prisma.customer.count(),
      prisma.package.count(),
    ]);
  } catch (error) {
    console.error("Analytics DB fallback:", error);
  }

  const revenue = quotes.reduce((s, q) => s + q.totalCost, 0);
  const approved = quotes.filter((q) => q.status === "approved").length;
  const installed = quotes.filter((q) => q.status === "installed").length;
  const pending = quotes.filter((q) => q.status === "pending").length;

  const bySystem = quotes.reduce<Record<string, number>>((acc, q) => {
    acc[q.systemType] = (acc[q.systemType] || 0) + 1;
    return acc;
  }, {});

  const byMonth = quotes.reduce<Record<string, number>>((acc, q) => {
    const k = `${q.createdAt.getFullYear()}-${String(q.createdAt.getMonth() + 1).padStart(2, "0")}`;
    acc[k] = (acc[k] || 0) + q.totalCost;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold">PKR {revenue.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-gray-500">Customers</p><p className="text-2xl font-bold">{customers}</p></Card>
        <Card><p className="text-sm text-gray-500">Packages</p><p className="text-2xl font-bold">{packages}</p></Card>
        <Card><p className="text-sm text-gray-500">Quotes</p><p className="text-2xl font-bold">{quotes.length}</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Quote Status Split</h2>
          <p>Pending: {pending}</p>
          <p>Approved: {approved}</p>
          <p>Installed: {installed}</p>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">System Type Demand</h2>
          {Object.entries(bySystem).map(([k, v]) => <p key={k}>{k}: {v}</p>)}
          {!Object.keys(bySystem).length ? <p className="text-gray-500">No data yet.</p> : null}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Monthly Revenue</h2>
        <div className="space-y-1">
          {Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([m, val]) => <p key={m}>{m}: PKR {val.toLocaleString()}</p>)}
          {!Object.keys(byMonth).length ? <p className="text-gray-500">No revenue records yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
