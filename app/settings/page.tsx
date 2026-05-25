"use client";

import { useEffect, useState } from "react";

type AppSettings = {
  companyName: string;
  rates: {
    onGrid: number;
    hybrid: number;
    offGrid: number;
  };
  canadianExtraPerKw: number;
  batteryAddon: number;
  panelWattsByBrand: Record<string, number>;
  inverterSupportByBrand: Record<string, number>;
};

const defaultSettings: AppSettings = {
  companyName: "Solar Pro",
  rates: {
    onGrid: 85000,
    hybrid: 105000,
    offGrid: 130000,
  },
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
    "SMA": 20,
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [savedAt, setSavedAt] = useState<string>("");
  const [newBrand, setNewBrand] = useState("");
  const [newBrandWatts, setNewBrandWatts] = useState(550);
  const [newInverter, setNewInverter] = useState("");
  const [newInverterPlates, setNewInverterPlates] = useState(10);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setSettings(normalizeSettings(JSON.parse(raw)));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const setNumber = (path: string, value: string) => {
    const num = Number(value || 0);
    setSettings((prev) => {
      const next = { ...prev } as AppSettings;
      if (path === "rates.onGrid") next.rates.onGrid = num;
      if (path === "rates.hybrid") next.rates.hybrid = num;
      if (path === "rates.offGrid") next.rates.offGrid = num;
      if (path === "canadianExtraPerKw") next.canadianExtraPerKw = num;
      if (path === "batteryAddon") next.batteryAddon = num;
      if (path.startsWith("panelWattsByBrand.")) {
        const brand = path.replace("panelWattsByBrand.", "");
        next.panelWattsByBrand[brand] = num;
      }
      return next;
    });
  };

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setSavedAt(new Date().toLocaleTimeString());
  };

  const reset = () => {
    setSettings(defaultSettings);
    localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
    setSavedAt(new Date().toLocaleTimeString());
  };

  const addBrand = () => {
    const name = newBrand.trim();
    if (!name) return;
    setSettings((prev) => ({
      ...prev,
      panelWattsByBrand: { ...prev.panelWattsByBrand, [name]: Number(newBrandWatts || 550) },
    }));
    setNewBrand("");
    setNewBrandWatts(550);
  };

  const removeBrand = (brand: string) => {
    setSettings((prev) => {
      const next = { ...prev.panelWattsByBrand };
      delete next[brand];
      return { ...prev, panelWattsByBrand: next };
    });
  };

  const addInverter = () => {
    const name = newInverter.trim();
    if (!name) return;
    setSettings((prev) => ({
      ...prev,
      inverterSupportByBrand: { ...prev.inverterSupportByBrand, [name]: Number(newInverterPlates || 1) },
    }));
    setNewInverter("");
    setNewInverterPlates(10);
  };

  const removeInverter = (brand: string) => {
    setSettings((prev) => {
      const next = { ...prev.inverterSupportByBrand };
      delete next[brand];
      return { ...prev, inverterSupportByBrand: next };
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Calculator aur pricing behavior yahan se control hoga.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h3 className="font-semibold">Company</h3>
          <input
            className="h-10 w-full rounded border px-3"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            placeholder="Company name"
          />
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h3 className="font-semibold">System Pricing (per kW)</h3>
          <label className="text-sm text-gray-600">On-grid Rate (PKR / kW)</label>
          <input className="h-10 w-full rounded border px-3" type="number" value={settings.rates.onGrid} onChange={(e) => setNumber("rates.onGrid", e.target.value)} placeholder="On-grid" />
          <label className="text-sm text-gray-600">Hybrid Rate (PKR / kW)</label>
          <input className="h-10 w-full rounded border px-3" type="number" value={settings.rates.hybrid} onChange={(e) => setNumber("rates.hybrid", e.target.value)} placeholder="Hybrid" />
          <label className="text-sm text-gray-600">Off-grid Rate (PKR / kW)</label>
          <input className="h-10 w-full rounded border px-3" type="number" value={settings.rates.offGrid} onChange={(e) => setNumber("rates.offGrid", e.target.value)} placeholder="Off-grid" />
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h3 className="font-semibold">Add-ons</h3>
          <label className="text-sm text-gray-600">Canadian Brand Extra (PKR / kW)</label>
          <input className="h-10 w-full rounded border px-3" type="number" value={settings.canadianExtraPerKw} onChange={(e) => setNumber("canadianExtraPerKw", e.target.value)} placeholder="Canadian brand extra per kW" />
          <label className="text-sm text-gray-600">Battery Add-on Price (PKR)</label>
          <input className="h-10 w-full rounded border px-3" type="number" value={settings.batteryAddon} onChange={(e) => setNumber("batteryAddon", e.target.value)} placeholder="Battery add-on" />
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h3 className="font-semibold">Panel Watts by Brand</h3>
          <div className="grid grid-cols-[1fr_120px_auto] gap-2">
            <input className="h-10 rounded border px-3" placeholder="New Brand Name" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
            <input className="h-10 rounded border px-3" type="number" min={1} placeholder="Watts" value={newBrandWatts} onChange={(e) => setNewBrandWatts(Number(e.target.value || 1))} />
            <button type="button" className="rounded border px-3" onClick={addBrand}>Add Brand</button>
          </div>
          {Object.entries(settings.panelWattsByBrand).map(([brand, watts]) => (
            <div key={brand} className="space-y-1">
              <label className="text-sm text-gray-600">{brand} Panel Watts (W)</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="h-10 w-full rounded border px-3"
                  type="number"
                  value={watts}
                  onChange={(e) => setNumber(`panelWattsByBrand.${brand}`, e.target.value)}
                  placeholder={brand}
                />
                <button type="button" className="rounded border px-3 text-red-600" onClick={() => removeBrand(brand)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-3">
          <h3 className="font-semibold">Inverter Support by Brand</h3>
          <div className="grid grid-cols-[1fr_130px_auto] gap-2">
            <input className="h-10 rounded border px-3" placeholder="New Inverter Brand" value={newInverter} onChange={(e) => setNewInverter(e.target.value)} />
            <input className="h-10 rounded border px-3" type="number" min={1} placeholder="Plates" value={newInverterPlates} onChange={(e) => setNewInverterPlates(Number(e.target.value || 1))} />
            <button type="button" className="rounded border px-3" onClick={addInverter}>Add Inverter</button>
          </div>
          {Object.entries(settings.inverterSupportByBrand).map(([brand, support]) => (
            <div key={brand} className="space-y-1">
              <label className="text-sm text-gray-600">{brand} Supported Plates</label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="h-10 w-full rounded border px-3"
                  type="number"
                  value={support}
                  onChange={(e) => setSettings((prev) => ({ ...prev, inverterSupportByBrand: { ...prev.inverterSupportByBrand, [brand]: Number(e.target.value || 0) } }))}
                />
                <button type="button" className="rounded border px-3 text-red-600" onClick={() => removeInverter(brand)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-orange-600 px-4 py-2 text-white" onClick={save}>Save Settings</button>
        <button className="rounded border px-4 py-2" onClick={reset}>Reset Default</button>
        {savedAt ? <p className="self-center text-sm text-green-700">Saved at {savedAt}</p> : null}
      </div>
    </div>
  );
}
