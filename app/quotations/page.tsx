"use client";

import { useEffect, useState } from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

type Quote = { id: string; customer: { name: string; phone: string; city: string }; package: { name: string; capacity: number; systemType: string; panelBrand: string; inverterMake: string }; totalCost: number; status: string; createdAt: string };

const styles = StyleSheet.create({ page: { padding: 24 }, title: { fontSize: 18, marginBottom: 12 }, row: { marginBottom: 6 } });

export default function QuotationsPage() {
  const [rows, setRows] = useState<Quote[]>([]);
  const [filter, setFilter] = useState("all");
  const load = async () => setRows(await fetch("/api/quotes").then((r) => r.json()));
  useEffect(() => { load(); }, []);
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const downloadPdf = async (q: Quote) => {
    const blob = await pdf(<Document><Page size="A4" style={styles.page}><Text style={styles.title}>Solar Pro Quotation</Text><View><Text style={styles.row}>Customer: {q.customer.name}</Text><Text style={styles.row}>Phone: {q.customer.phone}</Text><Text style={styles.row}>Package: {q.package.name} ({q.package.capacity}kW)</Text><Text style={styles.row}>System: {q.package.systemType}</Text><Text style={styles.row}>Panel Brand: {q.package.panelBrand}</Text><Text style={styles.row}>Inverter: {q.package.inverterMake}</Text><Text style={styles.row}>Total: PKR {q.totalCost.toLocaleString()}</Text></View></Page></Document>).toBlob();
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `quote-${q.id}.pdf`; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-4"><div><select className="rounded border px-3 py-2" value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">All</option><option value="pending">pending</option><option value="approved">approved</option><option value="installed">installed</option></select></div><div className="overflow-x-auto rounded border bg-white"><table className="w-full text-sm"><thead><tr><th className="border-b p-2 text-left">Customer</th><th className="border-b p-2 text-left">Package</th><th className="border-b p-2 text-left">Cost</th><th className="border-b p-2 text-left">Status</th><th className="border-b p-2 text-left">Date</th><th className="border-b p-2 text-left">PDF</th></tr></thead><tbody>{shown.map((q)=><tr key={q.id}><td className="border-b p-2">{q.customer?.name}</td><td className="border-b p-2">{q.package?.name}</td><td className="border-b p-2">PKR {q.totalCost.toLocaleString()}</td><td className="border-b p-2"><select className="rounded border px-2 py-1" value={q.status} onChange={async(e)=>{await fetch(`/api/quotes/${q.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:e.target.value})});load();}}><option>pending</option><option>approved</option><option>installed</option></select></td><td className="border-b p-2">{new Date(q.createdAt).toLocaleDateString()}</td><td className="border-b p-2"><button className="rounded bg-orange-600 px-2 py-1 text-white" onClick={()=>downloadPdf(q)}>Download PDF</button></td></tr>)}</tbody></table></div></div>;
}
