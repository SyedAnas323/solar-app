"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PublicCalculatorProps = {
  systemTypes: string[];
  capacities: number[];
  panelBrands: string[];
};

const baseRates: Record<string, number> = {
  "on-grid": 85000,
  hybrid: 105000,
  "off-grid": 130000,
};

export default function PublicCalculator({ systemTypes, capacities, panelBrands }: PublicCalculatorProps) {
  const [systemType, setSystemType] = useState(systemTypes[0] || "on-grid");
  const [capacityKw, setCapacityKw] = useState(capacities[0] || 5);
  const [panelBrand, setPanelBrand] = useState(panelBrands[0] || "Longi");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => {
    const base = (baseRates[systemType] || 0) * capacityKw;
    const brandExtra = panelBrand === "Canadian Solar" ? 5000 * capacityKw : 0;
    return base + brandExtra;
  }, [systemType, capacityKw, panelBrand]);

  const saveQuote = async () => {
    if (!name || !phone) return alert("Please enter name and phone.");
    setSaving(true);
    try {
      const customer = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city: "Pakistan" }),
      }).then((r) => r.json());

      const packages = await fetch("/api/packages").then((r) => r.json());
      const selected = packages.find((p: any) => p.systemType === systemType && Number(p.capacity) === Number(capacityKw) && p.panelBrand === panelBrand)
        || packages.find((p: any) => p.systemType === systemType && Number(p.capacity) === Number(capacityKw))
        || packages[0];

      if (!selected?.id) return alert("No package configured yet. Please contact admin.");

      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          packageId: selected.id,
          capacityKw,
          systemType,
          totalCost: total,
        }),
      });

      alert("Quote saved. Our team will contact you soon.");
      setName("");
      setPhone("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="calculator" className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold">Cost Calculator</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select className="h-11 rounded-lg border px-3" value={systemType} onChange={(e) => setSystemType(e.target.value)}>{systemTypes.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="h-11 rounded-lg border px-3" value={capacityKw} onChange={(e) => setCapacityKw(Number(e.target.value))}>{capacities.map((c) => <option key={c} value={c}>{c} kW</option>)}</select>
        <select className="h-11 rounded-lg border px-3" value={panelBrand} onChange={(e) => setPanelBrand(e.target.value)}>{panelBrands.map((b) => <option key={b}>{b}</option>)}</select>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={total}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1], color: ["#ea580c", "#c2410c", "#ea580c"] }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-3xl font-bold text-orange-600 transition-colors duration-300"
        >
          PKR {total.toLocaleString()}
        </motion.p>
      </AnimatePresence>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input className="h-11 rounded-lg border px-3" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="h-11 rounded-lg border px-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="h-11 rounded-lg bg-orange-600 font-semibold text-white" onClick={saveQuote} disabled={saving}>{saving ? "Saving..." : "Save as Quote"}</button>
      </div>
    </div>
  );
}
