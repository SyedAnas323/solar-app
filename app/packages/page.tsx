"use client";

import { useEffect, useMemo, useState } from "react";

type Pkg = {
  id: string;
  name: string;
  capacity: number;
  systemType: string;
  panelBrand: string;
  panelCount: number;
  inverterMake: string;
  batteryKwh: number | null;
  basePrice: number;
  panelWatts: number;
  isActive: boolean;
};

type AppSettings = {
  panelWattsByBrand: Record<string, number>;
  inverterSupportByBrand?: Record<string, number>;
};

const storageKey = "solar_settings_v1";

const empty = {
  name: "",
  capacity: 5,
  systemType: "on-grid",
  panelBrand: "Longi",
  panelWatts: 550,
  panelCount: 10,
  inverterMake: "",
  batteryKwh: "",
  basePrice: 0,
  isActive: true,
};

export default function PackagesPage() {
  const [rows, setRows] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [brands, setBrands] = useState<Record<string, number>>({ Longi: 550 });
  const [customBrand, setCustomBrand] = useState("");
  const [customBrandWatts, setCustomBrandWatts] = useState(550);
  const [inverterMap, setInverterMap] = useState<Record<string, number>>({ Inverex: 12 });
  const [customInverter, setCustomInverter] = useState("");
  const [customInverterPlates, setCustomInverterPlates] = useState(10);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/packages");
    setRows(await r.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: AppSettings = JSON.parse(raw);
        if (parsed?.panelWattsByBrand && Object.keys(parsed.panelWattsByBrand).length) {
          setBrands(parsed.panelWattsByBrand);
          setForm((prev: any) => ({ ...prev, panelBrand: Object.keys(parsed.panelWattsByBrand)[0], panelWatts: Object.values(parsed.panelWattsByBrand)[0] }));
        }
        if (parsed?.inverterSupportByBrand && Object.keys(parsed.inverterSupportByBrand).length) {
          const inverterSupport = parsed.inverterSupportByBrand ?? {};
          const firstInverter = Object.keys(inverterSupport)[0] ?? "";
          setInverterMap(inverterSupport);
          setForm((prev: any) => ({ ...prev, inverterMake: prev.inverterMake || firstInverter }));
        }
      } catch {
        // ignore malformed settings
      }
    }
  }, []);

  const shown = filter === "all" ? rows : rows.filter((r) => r.systemType === filter);
  const brandNames = useMemo(() => Object.keys(brands), [brands]);
  const inverterNames = useMemo(() => Object.keys(inverterMap), [inverterMap]);

  const onBrandChange = (brand: string) => {
    setForm({ ...form, panelBrand: brand, panelWatts: brands[brand] || form.panelWatts });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select className="rounded border px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="on-grid">on-grid</option>
          <option value="hybrid">hybrid</option>
          <option value="off-grid">off-grid</option>
        </select>
        <button className="rounded bg-orange-600 px-3 py-2 text-white" onClick={() => { setForm({ ...empty, panelBrand: brandNames[0] || "Longi", panelWatts: brands[brandNames[0]] || 550 }); setEditId(null); setOpen(true); }}>
          Add New Package
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <div className="rounded border bg-white p-4" key={p.id}>
              <h3 className="font-semibold">{p.name}</h3>
              <p>{p.capacity} kW - {p.systemType}</p>
              <p>{p.panelBrand} ({p.panelCount} panels)</p>
              <p>Inverter: {p.inverterMake}</p>
              {p.batteryKwh ? <p>Battery: {p.batteryKwh} kWh</p> : null}
              <p className="font-bold">PKR {p.basePrice.toLocaleString()}</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded border px-2 py-1" onClick={() => { setEditId(p.id); setForm({ ...p, batteryKwh: p.batteryKwh ?? "" }); setOpen(true); }}>Edit</button>
                <button className="rounded border px-2 py-1 text-red-600" onClick={async () => { await fetch(`/api/packages/${p.id}`, { method: "DELETE" }); load(); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded bg-white"
            onSubmit={async (e) => {
              e.preventDefault();
              const payload = {
                ...form,
                capacity: Number(form.capacity),
                panelWatts: Number(form.panelWatts),
                panelCount: Number(form.panelCount),
                basePrice: Number(form.basePrice),
                batteryKwh: form.batteryKwh ? Number(form.batteryKwh) : null,
              };
              await fetch(editId ? `/api/packages/${editId}` : "/api/packages", {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              setOpen(false);
              load();
            }}
          >
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">{editId ? "Edit" : "Add"} Package</h3>
            </div>

            <div className="space-y-2 overflow-y-auto p-4">

            <input className="h-10 w-full rounded border px-3" placeholder="Package Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="text-sm text-gray-600">Inverter Brand</label>
            <select className="h-10 w-full rounded border px-3" value={form.inverterMake} onChange={(e) => setForm({ ...form, inverterMake: e.target.value })}>
              <option value="">Select inverter brand</option>
              {inverterNames.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <div className="grid grid-cols-[1fr_140px] gap-2">
              <input className="h-10 w-full rounded border px-3" placeholder="Custom Inverter Brand" value={customInverter} onChange={(e) => setCustomInverter(e.target.value)} />
              <input className="h-10 w-full rounded border px-3" type="number" min={1} placeholder="Plates" value={customInverterPlates} onChange={(e) => setCustomInverterPlates(Number(e.target.value || 1))} />
            </div>
            <button
              type="button"
              className="rounded border px-3 py-2 text-sm"
              onClick={() => {
                const name = customInverter.trim();
                if (!name) return;
                const next = { ...inverterMap, [name]: Number(customInverterPlates || 1) };
                setInverterMap(next);
                const raw = localStorage.getItem(storageKey);
                const parsed = raw ? JSON.parse(raw) : {};
                localStorage.setItem(storageKey, JSON.stringify({ ...parsed, inverterSupportByBrand: next }));
                setForm({ ...form, inverterMake: name });
                setCustomInverter("");
              }}
            >
              Add Inverter Here
            </button>

            <label className="text-sm text-gray-600">Panel Brand</label>
            <select className="h-10 w-full rounded border px-3" value={form.panelBrand} onChange={(e) => onBrandChange(e.target.value)}>
              {brandNames.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>

            <div className="grid grid-cols-[1fr_140px] gap-2">
              <input className="h-10 w-full rounded border px-3" placeholder="Custom Brand Name" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} />
              <input className="h-10 w-full rounded border px-3" type="number" min={1} placeholder="Watts" value={customBrandWatts} onChange={(e) => setCustomBrandWatts(Number(e.target.value || 1))} />
            </div>
            <button
              type="button"
              className="rounded border px-3 py-2 text-sm"
              onClick={() => {
                const name = customBrand.trim();
                if (!name) return;
                const next = { ...brands, [name]: Number(customBrandWatts || 550) };
                setBrands(next);
                const raw = localStorage.getItem(storageKey);
                const parsed = raw ? JSON.parse(raw) : {};
                localStorage.setItem(storageKey, JSON.stringify({ ...parsed, panelWattsByBrand: next }));
                setForm({ ...form, panelBrand: name, panelWatts: Number(customBrandWatts || 550) });
                setCustomBrand("");
              }}
            >
              Add Brand Here
            </button>

            <input className="h-10 w-full rounded border px-3" type="number" placeholder="Capacity (kW)" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            <select className="h-10 w-full rounded border px-3" value={form.systemType} onChange={(e) => setForm({ ...form, systemType: e.target.value })}>
              <option>on-grid</option>
              <option>hybrid</option>
              <option>off-grid</option>
            </select>
            <input className="h-10 w-full rounded border px-3" type="number" placeholder="Panel Watts" value={form.panelWatts} onChange={(e) => setForm({ ...form, panelWatts: e.target.value })} />
            <input className="h-10 w-full rounded border px-3" type="number" placeholder="Panel Count" value={form.panelCount} onChange={(e) => setForm({ ...form, panelCount: e.target.value })} />
            {form.inverterMake && inverterMap[form.inverterMake] ? (
              <p className={`text-sm ${Number(form.panelCount) > inverterMap[form.inverterMake] ? "text-red-600" : "text-green-700"}`}>
                {form.inverterMake} supports up to {inverterMap[form.inverterMake]} plates.
              </p>
            ) : null}
            <input className="h-10 w-full rounded border px-3" type="number" placeholder="Battery kWh" value={form.batteryKwh} onChange={(e) => setForm({ ...form, batteryKwh: e.target.value })} />
            <input className="h-10 w-full rounded border px-3" type="number" placeholder="Base Price (PKR)" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
            </div>

            <div className="sticky bottom-0 flex gap-2 border-t bg-white p-4">
              <button className="rounded bg-orange-600 px-3 py-2 text-white">Save</button>
              <button type="button" className="rounded border px-3 py-2" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
