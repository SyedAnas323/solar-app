"use client";

import { useEffect, useMemo, useState } from "react";

type Quote = {
  id: string;
  status: string;
  createdAt: string;
  totalCost: number;
  customer: { name: string; phone: string; city: string };
  package: { name: string; capacity: number; systemType: string; inverterMake: string; panelCount: number };
};

const storageKey = "installation_notes_v1";

export default function InstallationsPage() {
  const [rows, setRows] = useState<Quote[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");

  const load = async () => setRows(await fetch("/api/quotes").then((r) => r.json()));
  useEffect(() => { load(); const raw = localStorage.getItem(storageKey); if (raw) setNotes(JSON.parse(raw)); }, []);

  const shown = useMemo(() => {
    const base = rows.filter((r) => r.status === "approved" || r.status === "installed");
    if (filter === "all") return base;
    return base.filter((r) => r.status === filter);
  }, [rows, filter]);

  const saveNote = (id: string, note: string) => {
    const next = { ...notes, [id]: note };
    setNotes(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h1 className="text-2xl font-bold">Installations</h1>
        <p className="text-sm text-gray-500">Approved/Installed quotes ki deployment tracking.</p>
      </div>

      <div className="flex gap-2">
        <select className="rounded border px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="approved">approved</option>
          <option value="installed">installed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">Customer</th>
              <th className="border-b p-2 text-left">Package</th>
              <th className="border-b p-2 text-left">Plates</th>
              <th className="border-b p-2 text-left">Inverter</th>
              <th className="border-b p-2 text-left">Status</th>
              <th className="border-b p-2 text-left">Site Note</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((q) => (
              <tr key={q.id}>
                <td className="border-b p-2">{q.customer?.name}<div className="text-xs text-gray-500">{q.customer?.phone}</div></td>
                <td className="border-b p-2">{q.package?.name}<div className="text-xs text-gray-500">{q.package?.capacity} kW</div></td>
                <td className="border-b p-2">{q.package?.panelCount ?? "-"}</td>
                <td className="border-b p-2">{q.package?.inverterMake ?? "-"}</td>
                <td className="border-b p-2">
                  <select className="rounded border px-2 py-1" value={q.status} onChange={async (e) => { await fetch(`/api/quotes/${q.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: e.target.value }) }); load(); }}>
                    <option>approved</option>
                    <option>installed</option>
                  </select>
                </td>
                <td className="border-b p-2">
                  <input className="w-64 rounded border px-2 py-1" placeholder="Crew / date / location note" value={notes[q.id] || ""} onChange={(e) => saveNote(q.id, e.target.value)} />
                </td>
              </tr>
            ))}
            {!shown.length ? <tr><td className="p-3 text-gray-500" colSpan={6}>No installation records yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
