"use client";

import { useEffect, useMemo, useState } from "react";

type AppSettings = {
  companyName: string;
  rates: { onGrid: number; hybrid: number; offGrid: number };
  canadianExtraPerKw: number;
  batteryAddon: number;
  panelWattsByBrand: Record<string, number>;
  inverterSupportByBrand: Record<string, number>;
};

const defaultSettings: AppSettings = {
  companyName: "Solar Pro",
  rates: { onGrid: 85000, hybrid: 105000, offGrid: 130000 },
  canadianExtraPerKw: 5000,
  batteryAddon: 180000,
  panelWattsByBrand: {
    Longi: 550,
    "JA Solar": 560,
    "Canadian Solar": 570,
    "Jinko Solar": 575,
    "Trina Solar": 580,
    "Risen Energy": 580,
    Astronergy: 575,
    "AE Solar": 570,
    "Hyundai Energy": 565,
    "TW Solar": 575,
    "RENA Solar": 560,
    "Phono Solar": 555,
  },
  inverterSupportByBrand: {
    Inverex: 12,
    Growatt: 14,
    Solis: 16,
    Huawei: 18,
    Knox: 10,
    Crown: 12,
    Fronius: 20,
    GoodWe: 16,
    Sungrow: 18,
    SMA: 20,
  },
};

const storageKey = "solar_settings_v1";
const normalizeSettings = (input: any): AppSettings => ({
  companyName: input?.companyName ?? defaultSettings.companyName,
  rates: {
    onGrid: input?.rates?.onGrid ?? defaultSettings.rates.onGrid,
    hybrid: input?.rates?.hybrid ?? defaultSettings.rates.hybrid,
    offGrid: input?.rates?.offGrid ?? defaultSettings.rates.offGrid,
  },
  canadianExtraPerKw: input?.canadianExtraPerKw ?? defaultSettings.canadianExtraPerKw,
  batteryAddon: input?.batteryAddon ?? defaultSettings.batteryAddon,
  panelWattsByBrand: {
    ...defaultSettings.panelWattsByBrand,
    ...(input?.panelWattsByBrand || {}),
  },
  inverterSupportByBrand: {
    ...defaultSettings.inverterSupportByBrand,
    ...(input?.inverterSupportByBrand || {}),
  },
});

export default function CalculatorPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [systemType, setSystemType] = useState<"on-grid" | "hybrid" | "off-grid">("on-grid");
  const [capacityKw, setCapacityKw] = useState(5);
  const [panelBrand, setPanelBrand] = useState("Longi");
  const [addBattery, setAddBattery] = useState(false);
  const [customBatteryPrice, setCustomBatteryPrice] = useState(defaultSettings.batteryAddon);
  const [panelMode, setPanelMode] = useState<"auto" | "manual">("auto");
  const [manualPanelCount, setManualPanelCount] = useState(10);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lahore");

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSettings(normalizeSettings(parsed));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const pricing = useMemo(() => {
    const rate = systemType === "on-grid" ? settings.rates.onGrid : systemType === "hybrid" ? settings.rates.hybrid : settings.rates.offGrid;
    const base = rate * capacityKw;
    const brandExtra = panelBrand === "Canadian Solar" ? settings.canadianExtraPerKw * capacityKw : 0;
    const battery = addBattery ? customBatteryPrice : 0;
    const total = base + brandExtra + battery;
    const panelWatts = settings.panelWattsByBrand[panelBrand] || 550;
    const autoPanelCount = Math.ceil((capacityKw * 1000) / panelWatts);
    const panelCount = panelMode === "manual" ? manualPanelCount : autoPanelCount;
    return { rate, base, brandExtra, battery, total, panelWatts, panelCount };
  }, [systemType, settings, capacityKw, panelBrand, addBattery, customBatteryPrice, panelMode, manualPanelCount]);
  const matchingInverters = useMemo(
    () => Object.entries(settings.inverterSupportByBrand).filter(([, support]) => support >= pricing.panelCount),
    [settings.inverterSupportByBrand, pricing.panelCount],
  );

  const saveQuote = async () => {
    if (!customerName || !phone) {
      alert("Customer name aur phone ????? hain");
      return;
    }
    const c = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: customerName, phone, city }) }).then((r) => r.json());
    const pkgs = await fetch("/api/packages").then((r) => r.json());
    const pkg = pkgs.find((p: any) => p.systemType === systemType && Number(p.capacity) === Number(capacityKw)) || pkgs[0];
    if (!pkg?.id) {
      alert("Pehle Packages page me ek package add karein");
      return;
    }
    await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId: c.id, packageId: pkg.id, capacityKw, systemType, totalCost: pricing.total }) });
    alert("Quote saved");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-xl border bg-white p-5">
        <h1 className="text-3xl font-bold">Cost Calculator</h1>
        <p className="mt-1 text-sm text-gray-500">{settings.companyName} - live pricing engine</p>

        <div className="mt-4 grid gap-3">
          <select className="h-11 w-full rounded-lg border px-3" value={systemType} onChange={(e) => setSystemType(e.target.value as any)}>
            <option value="on-grid">on-grid</option>
            <option value="hybrid">hybrid</option>
            <option value="off-grid">off-grid</option>
          </select>

          <select className="h-11 w-full rounded-lg border px-3" value={capacityKw} onChange={(e) => setCapacityKw(Number(e.target.value))}>
            {[3, 5, 8, 10, 15, 20].map((k) => <option key={k} value={k}>{k} kW</option>)}
          </select>

          <select className="h-11 w-full rounded-lg border px-3" value={panelBrand} onChange={(e) => setPanelBrand(e.target.value)}>
            {Object.keys(settings.panelWattsByBrand).map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-lg border px-3 py-3">
            <input type="checkbox" checked={addBattery} onChange={(e) => setAddBattery(e.target.checked)} />
            Add Battery
          </label>
          {addBattery ? (
            <input
              className="h-11 w-full rounded-lg border px-3"
              type="number"
              min={0}
              value={customBatteryPrice}
              onChange={(e) => setCustomBatteryPrice(Number(e.target.value || 0))}
              placeholder="Battery price (PKR)"
            />
          ) : null}
        </div>

        <div className="mt-5 rounded-xl bg-slate-900 p-4 text-white">
          <p className="text-xs uppercase tracking-wider text-slate-300">Estimated Total</p>
          <p className="mt-1 text-4xl font-bold">PKR {pricing.total.toLocaleString()}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-200">
            <p>Base ({capacityKw} x {pricing.rate.toLocaleString()}): PKR {pricing.base.toLocaleString()}</p>
            <p>Brand Extra: PKR {pricing.brandExtra.toLocaleString()}</p>
            <p>Battery: PKR {pricing.battery.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-semibold">Panel Estimator</h2>
          <div className="mt-3 flex gap-2">
            <button className={`rounded px-3 py-1.5 text-sm ${panelMode === "auto" ? "bg-orange-600 text-white" : "border"}`} onClick={() => setPanelMode("auto")}>Auto</button>
            <button className={`rounded px-3 py-1.5 text-sm ${panelMode === "manual" ? "bg-orange-600 text-white" : "border"}`} onClick={() => setPanelMode("manual")}>Manual</button>
          </div>
          {panelMode === "manual" ? (
            <input
              className="mt-3 h-11 w-full rounded-lg border px-3"
              type="number"
              min={1}
              value={manualPanelCount}
              onChange={(e) => setManualPanelCount(Number(e.target.value || 1))}
              placeholder="Kitni plates chahiye"
            />
          ) : null}
          <p className="mt-2 text-sm text-gray-500">Aap ko approx itni plates chahiye hongi:</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">{pricing.panelCount} Plates</p>
          <p className="mt-1 text-sm">Per panel watt: {pricing.panelWatts}W</p>
          <div className="mt-3">
            <p className="text-sm font-medium">Recommended Inverters:</p>
            {matchingInverters.length ? (
              <p className="text-sm text-gray-700">{matchingInverters.map(([name, support]) => `${name} (${support} plates)`).join(", ")}</p>
            ) : (
              <p className="text-sm text-red-600">Koi inverter is plate count ko support nahi karta. Settings me custom inverter add karein.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h2 className="text-xl font-semibold">Save as Quote</h2>
          <input className="h-11 w-full rounded-lg border px-3" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input className="h-11 w-full rounded-lg border px-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="h-11 w-full rounded-lg border px-3" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <button className="h-11 w-full rounded-lg bg-orange-600 font-semibold text-white" onClick={saveQuote}>Save Quote</button>
        </div>
      </div>
    </div>
  );
}
