import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableCell, TableHead } from "@/components/ui/table";

export default async function DashboardPage() {
  let packages: any[] = [];
  let quotes: any[] = [];

  try {
    [packages, quotes] = await prisma.$transaction([
      prisma.package.findMany(),
      prisma.quote.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
  } catch (error) {
    console.error("Dashboard DB fallback:", error);
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const quotesThisMonth = quotes.filter((q) => q.createdAt >= monthStart).length;
  const avgDeal = quotes.length ? quotes.reduce((s, q) => s + q.totalCost, 0) / quotes.length : 0;
  const popularKw = packages.sort((a, b) => b.capacity - a.capacity)[0]?.capacity || 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Total Packages</p><p className="text-2xl font-bold">{packages.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Quotes This Month</p><p className="text-2xl font-bold">{quotesThisMonth}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Most Popular kW</p><p className="text-2xl font-bold">{popularKw} kW</p></Card>
        <Card><p className="text-sm text-muted-foreground">Avg Deal Size</p><p className="text-2xl font-bold">PKR {avgDeal.toLocaleString()}</p></Card>
      </div>
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Recent Quotes</h2>
        <Table>
          <thead><tr><TableHead>Customer</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead></tr></thead>
          <tbody>{quotes.map((q) => <tr key={q.id}><TableCell>{q.customer.name}</TableCell><TableCell>PKR {q.totalCost.toLocaleString()}</TableCell><TableCell>{q.status}</TableCell></tr>)}</tbody>
        </Table>
      </Card>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link className="rounded-md bg-orange-600 px-3 py-2 text-white" href="/packages">Packages</Link>
        <Link className="rounded-md bg-orange-600 px-3 py-2 text-white" href="/calculator">Calculator</Link>
        <Link className="rounded-md bg-orange-600 px-3 py-2 text-white" href="/customers">Customers</Link>
        <Link className="rounded-md bg-orange-600 px-3 py-2 text-white" href="/quotations">Quotations</Link>
        <Link className="rounded-md bg-orange-600 px-3 py-2 text-white" href="/installations">Installations</Link>
        <Link className="rounded-md bg-orange-600 px-3 py-2 text-white" href="/analytics">Analytics</Link>
      </div>
    </div>
  );
}
