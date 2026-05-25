"use client";

import { useEffect, useState } from "react";

type Customer = { id: string; name: string; phone: string; city: string; createdAt: string; _count: { quotes: number } };

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", city: "" });

  const load = async () => setRows(await fetch("/api/customers").then((r) => r.json()));
  useEffect(() => { load(); }, []);

  return <div className="space-y-4"><div className="rounded border bg-white p-4"><h2 className="mb-2 text-lg font-semibold">Add New Customer</h2><div className="grid gap-2 md:grid-cols-4"><input className="h-10 rounded border px-3" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><input className="h-10 rounded border px-3" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/><input className="h-10 rounded border px-3" placeholder="City" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})}/><button className="rounded bg-orange-600 px-3 py-2 text-white" onClick={async()=>{await fetch('/api/customers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});setForm({name:'',phone:'',city:''});load();}}>Add</button></div></div><div className="overflow-x-auto rounded border bg-white"><table className="w-full text-sm"><thead><tr><th className="border-b p-2 text-left">Name</th><th className="border-b p-2 text-left">Phone</th><th className="border-b p-2 text-left">City</th><th className="border-b p-2 text-left">Total Quotes</th><th className="border-b p-2 text-left">Date Added</th></tr></thead><tbody>{rows.map((c)=><tr key={c.id} className="cursor-pointer hover:bg-orange-50" onClick={async()=>{setSelected(c.id);setQuotes(await fetch(`/api/customers/${c.id}/quotes`).then((r)=>r.json()));}}><td className="border-b p-2">{c.name}</td><td className="border-b p-2">{c.phone}</td><td className="border-b p-2">{c.city}</td><td className="border-b p-2">{c._count?.quotes ?? 0}</td><td className="border-b p-2">{new Date(c.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>{selected ? <div className="rounded border bg-white p-4"><h3 className="mb-2 font-semibold">Quote History</h3>{quotes.length ? quotes.map((q)=><p key={q.id} className="border-b py-2">{q.package?.name} - PKR {q.totalCost.toLocaleString()} - {q.status}</p>) : <p>No quotes found.</p>}</div> : null}</div>;
}
