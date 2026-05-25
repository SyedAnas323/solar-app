"use client";

import { useEffect, useMemo, useState } from "react";

type InverterItem = {
  brand: string;
  supportedPlates: number;
  capacityLabel: string;
  maxWatts: number;
};

type AppSettings = {
  inverterSupportByBrand?: Record<string, number>;
};

const settingsKey = "solar_settings_v1";
const inverterKey = "solar_inverters_v1";

const defaults: InverterItem[] = [
  { brand: "Inverex", supportedPlates: 12, capacityLabel: "5 kW", maxWatts: 6500 },
  { brand: "Growatt", supportedPlates: 14, capacityLabel: "6 kW", maxWatts: 7200 },
  { brand: "Solis", supportedPlates: 16, capacityLabel: "8 kW", maxWatts: 9000 },
  { brand: "Huawei", supportedPlates: 18, capacityLabel: "10 kW", maxWatts: 11000 },
  { brand: "Fronius", supportedPlates: 20, capacityLabel: "12 kW", maxWatts: 13000 },
  { brand: "GoodWe", supportedPlates: 16, capacityLabel: "8 kW", maxWatts: 9500 },
  { brand: "Sungrow", supportedPlates: 18, capacityLabel: "10 kW", maxWatts: 11500 },
  { brand: "SMA", supportedPlates: 20, capacityLabel: "12 kW", maxWatts: 14000 },
];

export default function InvertersPage() {
  const [rows, setRows] = useState<InverterItem[]>(defaults);
  const [form, setForm] = useState<InverterItem>({ brand: "", supportedPlates: 10, capacityLabel: "5 kW", maxWatts: 6000 });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(inverterKey);
    if (raw) {
      try {
        setRows(JSON.parse(raw));
        return;
      } catch {
        // ignore
      }
    }
    localStorage.setItem(inverterKey, JSON.stringify(defaults));
  }, []);

  const persist = (list: InverterItem[]) => {
    setRows(list);
    localStorage.setItem(inverterKey, JSON.stringify(list));

    const raw = localStorage.getItem(settingsKey);
    const parsed: AppSettings = raw ? JSON.parse(raw) : {};
    const supportMap = list.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.brand] = Number(cur.supportedPlates || 0);
      return acc;
    }, {});
    localStorage.setItem(settingsKey, JSON.stringify({ ...parsed, inverterSupportByBrand: supportMap }));
  };

  const addOrUpdate = () => {
    const brand = form.brand.trim();
    if (!brand) return;
    const idx = rows.findIndex((r) => r.brand.toLowerCase() === brand.toLowerCase());
    const next = [...rows];
    const item = { ...form, brand, supportedPlates: Number(form.supportedPlates || 0), maxWatts: Number(form.maxWatts || 0) };
    if (idx >= 0) next[idx] = item;
    else next.push(item);
    persist(next);
    setForm({ brand: "", supportedPlates: 10, capacityLabel: "5 kW", maxWatts: 6000 });
  };

  const edit = (item: InverterItem) => setForm(item);
  const remove = (brand: string) => persist(rows.filter((r) => r.brand !== brand));

  const shown = useMemo(() => rows.filter((r) => r.brand.toLowerCase().includes(query.toLowerCase())), [rows, query]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h1 className="text-2xl font-bold">Inverters Detail</h1>
        <p className="text-sm text-gray-500">Brand, supported plates, inverter capacity, aur max watt support.</p>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Add / Update Inverter</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input className="h-10 rounded border px-3" placeholder="Inverter Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className="h-10 rounded border px-3" type="number" min={1} placeholder="Supported Plates" value={form.supportedPlates} onChange={(e) => setForm({ ...form, supportedPlates: Number(e.target.value || 0) })} />
          <input className="h-10 rounded border px-3" placeholder="Capacity (e.g. 6 kW / 10 kVA)" value={form.capacityLabel} onChange={(e) => setForm({ ...form, capacityLabel: e.target.value })} />
          <input className="h-10 rounded border px-3" type="number" min={1} placeholder="Max Watts" value={form.maxWatts} onChange={(e) => setForm({ ...form, maxWatts: Number(e.target.value || 0) })} />
        </div>
        <button className="rounded bg-orange-600 px-4 py-2 text-white" onClick={addOrUpdate}>Save Inverter</button>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Inverter List</h2>
          <input className="h-9 rounded border px-3" placeholder="Search brand" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Brand</th>
                <th className="border-b p-2 text-left">Supported Plates</th>
                <th className="border-b p-2 text-left">Capacity</th>
                <th className="border-b p-2 text-left">Max Watt Support</th>
                <th className="border-b p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.brand}>
                  <td className="border-b p-2">{r.brand}</td>
                  <td className="border-b p-2">{r.supportedPlates}</td>
                  <td className="border-b p-2">{r.capacityLabel}</td>
                  <td className="border-b p-2">{r.maxWatts} W</td>
                  <td className="border-b p-2">
                    <div className="flex gap-2">
                      <button className="rounded border px-2 py-1" onClick={() => edit(r)}>Edit</button>
                      <button className="rounded border px-2 py-1 text-red-600" onClick={() => remove(r.brand)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!shown.length ? <tr><td className="p-3 text-gray-500" colSpan={5}>No inverter found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
