"use client";

import { useEffect, useMemo, useState } from "react";
import { Sun, Bolt, Cpu, PanelsTopLeft, BatteryCharging, ShieldCheck, Clock3, Receipt } from "lucide-react";

type PackageItem = {
  id: string;
  name: string;
  capacity: number;
  systemType: string;
  panelBrand: string;
  panelWatts: number;
  panelCount: number;
  inverterMake: string;
  batteryKwh: number | null;
  basePrice: number;
};

type InverterItem = {
  name: string;
  system: string;
  range: string;
  warranty: string;
};

type Props = {
  packages: PackageItem[];
  installedCount: number;
  totalQuotes: number;
  mostPopularId?: string;
  inverterDetails: InverterItem[];
  inverterNames: string[];
  systemTypes: string[];
  capacities: number[];
  panelBrands: string[];
};

function CountUp({ end }: { end: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const totalFrames = 60;
    const timer = setInterval(() => {
      frame += 1;
      const next = Math.round((end * frame) / totalFrames);
      setValue(next > end ? end : next);
      if (frame >= totalFrames) clearInterval(timer);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end]);
  return <>{value.toLocaleString()}</>;
}

export default function LandingClient({ packages, installedCount, totalQuotes, mostPopularId, inverterDetails, inverterNames, systemTypes, capacities, panelBrands }: Props) {
  const defaultCapacities = [3, 5, 8, 10, 12, 15, 20];
  const defaultPanelBrands = [
    "Longi",
    "JA Solar",
    "Canadian Solar",
    "Jinko Solar",
    "Trina Solar",
    "Risen Energy",
    "Astronergy",
    "AE Solar",
    "Hyundai Energy",
    "TW Solar",
    "RENA Solar",
    "Phono Solar",
  ];
  const [systemTypeOptions, setSystemTypeOptions] = useState<string[]>(systemTypes);
  const [capacityOptions, setCapacityOptions] = useState<number[]>(Array.from(new Set([...defaultCapacities, ...capacities])).sort((a, b) => a - b));
  const [panelBrandOptions, setPanelBrandOptions] = useState<string[]>(Array.from(new Set([...defaultPanelBrands, ...panelBrands])).sort());
  const [panelWattsMap, setPanelWattsMap] = useState<Record<string, number>>({});
  const [systemRatesByKw, setSystemRatesByKw] = useState<Record<string, number>>({
    "on-grid": 85000,
    hybrid: 105000,
    "off-grid": 130000,
  });
  const [brandRatePerWatt, setBrandRatePerWatt] = useState<Record<string, number>>({
    Longi: 41,
    "JA Solar": 40,
    "Canadian Solar": 42,
    "Jinko Solar": 43,
    "Trina Solar": 40,
    "Risen Energy": 39,
    Astronergy: 40,
    "AE Solar": 39,
    "Hyundai Energy": 41,
    "TW Solar": 39,
    "RENA Solar": 38,
    "Phono Solar": 38,
  });
  const [systemType, setSystemType] = useState(systemTypes[0] || "on-grid");
  const [capacityKw, setCapacityKw] = useState(capacities[0] || 5);
  const [panelBrand, setPanelBrand] = useState(panelBrands[0] || "Longi");
  const [pulse, setPulse] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCity, setLeadCity] = useState("Lahore");
  const [monthlyBill, setMonthlyBill] = useState(25000);
  const [roofSize, setRoofSize] = useState(800);
  const [backupHours, setBackupHours] = useState(4);
  const [needBattery, setNeedBattery] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [orderCustomerName, setOrderCustomerName] = useState("");
  const [orderCustomerPhone, setOrderCustomerPhone] = useState("");
  const [orderPanelBrand, setOrderPanelBrand] = useState(panelBrands[0] || "Longi");
  const [orderInverterBrand, setOrderInverterBrand] = useState(inverterNames[0] || "Growatt");
  const [orderPanelQty, setOrderPanelQty] = useState(10);
  const [orderPanelWatt, setOrderPanelWatt] = useState(550);
  const [orderWantBattery, setOrderWantBattery] = useState(false);
  const [orderBatteryKwh, setOrderBatteryKwh] = useState(5);
  const [orderBillPhotoName, setOrderBillPhotoName] = useState("");

  const totalCost = useMemo(() => {
    const baseRate = systemRatesByKw[systemType] || 0;
    const base = baseRate * capacityKw;
    const baselinePanelRate = brandRatePerWatt["Longi"] ?? 41;
    const chosenPanelRate = brandRatePerWatt[panelBrand] ?? baselinePanelRate;
    const brandDeltaPerWatt = chosenPanelRate - baselinePanelRate;
    const brandAdjustment = Math.round(brandDeltaPerWatt * capacityKw * 1000);
    return Math.max(0, Math.round(base + brandAdjustment));
  }, [systemType, capacityKw, panelBrand, systemRatesByKw, brandRatePerWatt]);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 300);
    return () => clearTimeout(t);
  }, [totalCost]);

  const monthlySavings = Math.round(totalCost / 70);
  const slabRates = [
    { min: 1, max: 100, rate: 19.99, label: "1-100 units" },
    { min: 101, max: 200, rate: 26.91, label: "101-200 units" },
    { min: 201, max: 300, rate: 29.47, label: "201-300 units" },
    { min: 301, max: 400, rate: 35.0, label: "301-400 units" },
    { min: 401, max: 500, rate: 40.56, label: "401-500 units" },
    { min: 501, max: 600, rate: 45.0, label: "501-600 units" },
    { min: 601, max: Infinity, rate: 50.0, label: "601+ units" },
  ];

  const estimateUnitsFromBill = (billAmount: number) => {
    const target = Math.max(0, billAmount);
    let remaining = target;
    let units = 0;

    for (const slab of slabRates) {
      const slabSize = slab.max === Infinity ? Infinity : slab.max - slab.min + 1;
      const slabCost = slab.max === Infinity ? Infinity : slabSize * slab.rate;

      if (remaining <= 0) break;

      if (slab.max === Infinity || remaining < slabCost) {
        units += remaining / slab.rate;
        remaining = 0;
      } else {
        units += slabSize;
        remaining -= slabCost;
      }
    }

    return Math.max(0, Math.round(units));
  };

  const selectedPackage = useMemo(() => {
    return (
      packages.find((p) => p.systemType === systemType && Number(p.capacity) === Number(capacityKw) && p.panelBrand === panelBrand) ||
      packages.find((p) => p.systemType === systemType && Number(p.capacity) === Number(capacityKw)) ||
      packages[0]
    );
  }, [packages, systemType, capacityKw, panelBrand]);

  const estimatedUnits = estimateUnitsFromBill(monthlyBill);
  const roiYears = Math.max(1, Number((totalCost / Math.max(monthlySavings, 1) / 12).toFixed(1)));
  const selectedPanelWatts = panelWattsMap[panelBrand] || selectedPackage?.panelWatts || 550;
  const estimatedPanelCount = Math.max(1, Math.ceil((capacityKw * 1000) / selectedPanelWatts));
  const inverterSizeKw = Number((capacityKw * 1.2).toFixed(1));
  const estimatedGenerationUnits = Math.round(capacityKw * 120);
  const orderPanelRatePerWatt = brandRatePerWatt[orderPanelBrand] ?? 40;
  const orderInverterRatePerKw = 60000;
  const orderBatteryRatePerKwh = 85000;
  const orderPanelSubtotal = Math.round(orderPanelQty * orderPanelWatt * orderPanelRatePerWatt);
  const orderSystemKw = Number(((orderPanelQty * orderPanelWatt) / 1000).toFixed(2));
  const orderInverterSuggestedKw = Math.max(3, Number((orderSystemKw * 0.8).toFixed(1)));
  const orderInverterSubtotal = Math.round(orderInverterSuggestedKw * orderInverterRatePerKw);
  const orderBatterySubtotal = orderWantBattery ? Math.round(orderBatteryKwh * orderBatteryRatePerKwh) : 0;
  const orderStructureWiringLabor = Math.round(orderPanelSubtotal * 0.18);
  const orderGrandTotal = orderPanelSubtotal + orderInverterSubtotal + orderBatterySubtotal + orderStructureWiringLabor;
  const orderSuggestedInverter = inverterNames.find((b) => {
    const l = b.toLowerCase();
    if (orderSystemKw >= 8) return l.includes("huawei") || l.includes("solis") || l.includes("growatt");
    if (orderSystemKw >= 5) return l.includes("growatt") || l.includes("solis");
    return l.includes("inverex") || l.includes("growatt");
  }) || inverterNames[0] || "Growatt";
  const orderSuggestedBatteryKwh = orderPanelQty >= 20 ? 15 : orderPanelQty >= 12 ? 10 : 5;

  const recommendedCapacity = useMemo(() => {
    let byBill = 3;
    if (estimatedUnits >= 250) byBill = 5;
    if (estimatedUnits >= 450) byBill = 8;
    if (estimatedUnits >= 700) byBill = 10;
    if (estimatedUnits >= 1000) byBill = 15;
    if (estimatedUnits >= 1400) byBill = 20;
    const roofLimit = Math.max(3, Math.min(20, Math.floor(roofSize / 80)));
    const finalKw = Math.min(byBill, roofLimit);
    const closest = capacityOptions.reduce((prev, curr) =>
      Math.abs(curr - finalKw) < Math.abs(prev - finalKw) ? curr : prev,
    capacityOptions[0] || 5);
    return closest;
  }, [estimatedUnits, roofSize, capacityOptions]);

  useEffect(() => {
    setCapacityKw(recommendedCapacity);
  }, [recommendedCapacity]);

  useEffect(() => {
    setNeedBattery(backupHours >= 4);
  }, [backupHours]);

  const handleSaveLead = async () => {
    if (!leadName.trim() || !leadPhone.trim()) {
      alert("Please enter customer name and phone.");
      return;
    }
    if (!selectedPackage?.id) {
      alert("No package found. Please ask admin to add packages.");
      return;
    }
    try {
      setSavingLead(true);
      const customer = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: leadName.trim(), phone: leadPhone.trim(), city: leadCity.trim() || "Lahore" }),
      }).then((r) => r.json());
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          packageId: selectedPackage.id,
          capacityKw,
          systemType,
          totalCost,
          status: "pending",
        }),
      });
      alert("Lead saved to admin panel successfully.");
    } catch {
      alert("Failed to save lead. Please try again.");
    } finally {
      setSavingLead(false);
    }
  };

  const handleWhatsApp = () => {
    const text = [
      "Assalam o Alaikum, I need a solar quotation.",
      `Name: ${leadName || "-"}`,
      `Phone: ${leadPhone || "-"}`,
      `City: ${leadCity}`,
      `Monthly Bill: PKR ${monthlyBill.toLocaleString()}`,
      `Roof Size: ${roofSize} sq ft`,
      `Backup Need: ${backupHours} hours`,
      `Suggested System: ${capacityKw} kW (${systemType})`,
      `Panel Count: ${estimatedPanelCount}`,
      `Inverter Size: ${inverterSizeKw} kW`,
      `Panel Brand: ${panelBrand}`,
      `Estimated Units: ${estimatedUnits}/month`,
      `Estimated Generation: ${estimatedGenerationUnits}/month`,
      `Estimated Savings: PKR ${monthlySavings.toLocaleString()}/month`,
      `Estimated ROI: ${roiYears} years`,
      `Estimated Cost: PKR ${totalCost.toLocaleString()}`,
    ].join("\n");
    window.open(`https://wa.me/923464777625?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleOrderWhatsApp = () => {
    const text = [
      "New Solar Product Order",
      `Name: ${orderCustomerName || "-"}`,
      `Phone: ${orderCustomerPhone || "-"}`,
      `Bill photo: ${orderBillPhotoName || "Not uploaded"}`,
      `Panel Brand: ${orderPanelBrand}`,
      `Panel Qty: ${orderPanelQty}`,
      `Panel Watt: ${orderPanelWatt}W`,
      `System Size: ${orderSystemKw} kW`,
      `Inverter Brand: ${orderInverterBrand}`,
      `Suggested Inverter: ${orderSuggestedInverter} (${orderInverterSuggestedKw} kW)`,
      `Battery Required: ${orderWantBattery ? "Yes" : "No"}`,
      `Battery Size: ${orderWantBattery ? `${orderBatteryKwh} kWh` : "-"}`,
      `Panel Total: PKR ${orderPanelSubtotal.toLocaleString()}`,
      `Inverter Total: PKR ${orderInverterSubtotal.toLocaleString()}`,
      `Battery Total: PKR ${orderBatterySubtotal.toLocaleString()}`,
      `Structure/Wiring/Labor: PKR ${orderStructureWiringLabor.toLocaleString()}`,
      `Grand Total Bill: PKR ${orderGrandTotal.toLocaleString()}`,
    ].join("\n");
    window.open(`https://wa.me/923464777625?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePdf = () => {
    const html = `
      <html><head><title>Solar Quotation</title>
      <style>
      body{font-family:Arial;padding:24px;color:#111}
      h1{color:#EA580C;margin:0 0 10px}
      .box{border:1px solid #ddd;border-radius:8px;padding:14px;margin:10px 0}
      .row{margin:6px 0}
      </style></head><body>
      <h1>SolarPro Pakistan - Quotation</h1>
      <div class="box">
      <div class="row"><b>Name:</b> ${leadName || "-"}</div>
      <div class="row"><b>Phone:</b> ${leadPhone || "-"}</div>
      <div class="row"><b>City:</b> ${leadCity}</div>
      <div class="row"><b>System:</b> ${capacityKw} kW (${systemType})</div>
      <div class="row"><b>Panel Count:</b> ${estimatedPanelCount}</div>
      <div class="row"><b>Inverter Size:</b> ${inverterSizeKw} kW</div>
      <div class="row"><b>Panel Brand:</b> ${panelBrand}</div>
      <div class="row"><b>Inverter:</b> ${selectedPackage?.inverterMake || "-"}</div>
      <div class="row"><b>Estimated Units:</b> ${estimatedUnits}/month</div>
      <div class="row"><b>Estimated Generation:</b> ${estimatedGenerationUnits}/month</div>
      <div class="row"><b>Monthly Savings:</b> PKR ${monthlySavings.toLocaleString()}</div>
      <div class="row"><b>ROI:</b> ${roiYears} years</div>
      <div class="row"><b>Total Cost:</b> PKR ${totalCost.toLocaleString()}</div>
      </div>
      <p>Generated by SolarPro Pakistan</p>
      </body></html>
    `;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  useEffect(() => {
    const settingsRaw = localStorage.getItem("solar_settings_v1");
    if (!settingsRaw) return;
    try {
      const settings = JSON.parse(settingsRaw) as {
        panelWattsByBrand?: Record<string, number>;
        systemPricing?: Record<string, number>;
        panelPricePerWatt?: Record<string, number>;
      };

      const dbSystemTypes = systemTypes;
      const dbCapacities = Array.from(new Set([...defaultCapacities, ...capacities])).sort((a, b) => a - b);
      const dbBrands = panelBrands;

      const settingsBrands = Object.keys(settings.panelWattsByBrand || {});
      const mergedBrands = Array.from(new Set([...defaultPanelBrands, ...dbBrands, ...settingsBrands])).sort();

      setSystemTypeOptions(dbSystemTypes);
      setCapacityOptions(dbCapacities);
      setPanelBrandOptions(mergedBrands);
      setPanelWattsMap(settings.panelWattsByBrand || {});
      if (settings.systemPricing) {
        setSystemRatesByKw((prev) => ({ ...prev, ...settings.systemPricing }));
      }
      if (settings.panelPricePerWatt) {
        setBrandRatePerWatt((prev) => ({ ...prev, ...settings.panelPricePerWatt }));
      }

      if (!mergedBrands.includes(panelBrand) && mergedBrands.length) {
        setPanelBrand(mergedBrands[0]);
      }
      if (!dbSystemTypes.includes(systemType) && dbSystemTypes.length) {
        setSystemType(dbSystemTypes[0]);
      }
      if (!dbCapacities.includes(capacityKw) && dbCapacities.length) {
        setCapacityKw(dbCapacities[0]);
      }
    } catch {
      setSystemTypeOptions(systemTypes);
      setCapacityOptions(Array.from(new Set([...defaultCapacities, ...capacities])).sort((a, b) => a - b));
      setPanelBrandOptions(Array.from(new Set([...defaultPanelBrands, ...panelBrands])).sort());
    }
  }, [systemTypes, capacities, panelBrands, panelBrand, systemType, capacityKw]);

  const marqueeItems = [
    ...Array.from(new Set(inverterNames)).map((b) => `${b} inverters`),
    "Longi Solar certified",
    "Canadian Solar partner",
    "Solis inverters",
    "Huawei FusionSolar",
    "Growatt authorized",
    "JA Solar certified",
    "500+ installations",
  ];

  return (
    <div className="bg-[#FFF7ED] font-sans text-[#1a1a1a]">
      <header className="border-b border-[#f0e8e0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="float-logo flex h-10 w-10 items-center justify-center rounded-xl bg-[#EA580C] text-white"><Sun size={18} /></div>
            <p className="text-lg font-semibold">SolarPro Pakistan</p>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {[
              ["#packages", "Packages"],
              ["#inverters", "Inverters"],
              ["#calculator", "Calculator"],
              ["#order-now", "Order"],
              ["#about", "About"],
            ].map(([href, label], i) => (
              <a key={href} href={href} className="landing-fadein text-sm text-[#666] hover:text-[#EA580C]" style={{ animationDelay: `${i * 0.1}s` }}>{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#order-now" className="btn-white-orange rounded-lg px-4 py-2 text-sm font-semibold">Order now</a>
            <a href="#calculator" className="btn-white-orange rounded-lg px-4 py-2 text-sm font-semibold">Get free quote</a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#FFF7ED]">
        <div className="hero-circle-1" />
        <div className="hero-circle-2" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <div className="landing-fadeup mb-4 inline-flex items-center gap-2 rounded-full bg-[#FED7AA] px-3 py-1 text-xs font-semibold text-[#9A3412]"><Bolt size={14} />Pakistan's #1 solar company</div>
            <h1 className="landing-fadeup max-w-xl text-[26px] font-medium leading-tight md:text-[56px] md:leading-[1.05]" style={{ animationDelay: "0.1s" }}>Save up to 80% on electricity bills with solar</h1>
            <p className="landing-fadeup mt-3 max-w-xl text-[13px] leading-7 text-[#666] md:text-[18px] md:leading-9" style={{ animationDelay: "0.2s" }}>Professional on-grid, hybrid & off-grid solar panel installation for homes and businesses across Pakistan. Transparent pricing, no hidden costs.</p>
            <div className="landing-fadeup mt-5 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
              <a href="#calculator" className="btn-white-orange rounded-xl px-6 py-3 text-sm font-semibold">Calculate savings</a>
              <a href="#packages" className="btn-white-orange rounded-lg px-4 py-2 text-sm font-semibold">View packages</a>
            </div>
          </div>

          <div className="hero-house">
            <svg viewBox="0 0 500 360" className="w-full max-w-md">
              <rect x="90" y="130" width="300" height="180" rx="10" fill="#FED7AA" />
              <polygon points="70,145 240,55 410,145" fill="#EA580C" />
              <rect x="220" y="210" width="50" height="100" fill="#C2410C" />
              <rect x="125" y="175" width="65" height="50" fill="#FFF7ED" stroke="#FDBA74" />
              <rect x="300" y="175" width="65" height="50" fill="#FFF7ED" stroke="#FDBA74" />
              <line x1="157" y1="175" x2="157" y2="225" stroke="#FDBA74" />
              <line x1="125" y1="200" x2="190" y2="200" stroke="#FDBA74" />
              <line x1="332" y1="175" x2="332" y2="225" stroke="#FDBA74" />
              <line x1="300" y1="200" x2="365" y2="200" stroke="#FDBA74" />
              <rect x="150" y="96" width="70" height="30" fill="#1f2937" className="panel-pop panel-1" />
              <rect x="225" y="84" width="70" height="30" fill="#1f2937" className="panel-pop panel-2" />
              <rect x="300" y="96" width="70" height="30" fill="#1f2937" className="panel-pop panel-3" />
              {[150, 225, 300].map((x) => <line key={`v${x}`} x1={x + 23} y1={x === 225 ? 84 : 96} x2={x + 23} y2={(x === 225 ? 84 : 96) + 30} stroke="#EA580C" />)}
              <circle cx="430" cy="70" r="24" fill="#FDBA74" />
              <line x1="430" y1="35" x2="430" y2="20" stroke="#FDBA74" />
              <line x1="430" y1="120" x2="430" y2="105" stroke="#FDBA74" />
              <line x1="395" y1="70" x2="380" y2="70" stroke="#FDBA74" />
              <line x1="480" y1="70" x2="465" y2="70" stroke="#FDBA74" />
              <rect x="0" y="308" width="500" height="52" fill="#FED7AA" opacity="0.4" />
            </svg>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#f0e8e0] bg-white py-3">
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <div key={`${item}-${idx}`} className="mx-5 inline-flex items-center gap-2 text-sm text-[#666]"><span className="h-2 w-2 rounded-full bg-[#EA580C]" />{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-4">
        <div className="mx-auto grid max-w-7xl gap-2 md:grid-cols-4">
        {[
          { value: installedCount, label: "Installations done" },
          { value: inverterNames.length, label: "Inverter brands" },
          { value: 10, label: "Panel warranty", suffix: "yr" },
          { value: 0, label: "Hidden charges", prefix: "PKR " },
        ].map((s, i) => (
          <div key={s.label} className="rounded-xl border border-[#f0e8e0] px-5 py-4">
            <p className="text-xl font-semibold text-[#EA580C]">{s.prefix || ""}<CountUp end={s.value} />{s.suffix || ""}</p>
            <p className="text-[11px] text-[#888]">{s.label}</p>
          </div>
        ))}
        </div>
      </section>

      <section id="packages" className="bg-white px-7 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">Our packages</p>
          <h2 className="mt-1 text-3xl font-semibold">Live solar packages</h2>
          <p className="mt-2 text-sm text-[#666]">Prices updated directly from our system - always accurate</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((p) => {
              const badge = p.systemType === "hybrid" ? { bg: "#FED7AA", color: "#9A3412", text: "Most popular" } : p.systemType === "off-grid" ? { bg: "#EDE9FE", color: "#5B21B6", text: "Premium" } : { bg: "#f3f4f6", color: "#6b7280", text: "Starter" };
              const isPopular = p.id === mostPopularId;
              return (
                <div key={p.id} className="landing-card card-hover-orange rounded-xl border bg-white p-4" style={{ borderColor: isPopular ? "#EA580C" : "#e5e7eb", borderWidth: isPopular ? 1.5 : 0.5 }}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.text}</span>
                    <p className="text-[20px] font-semibold text-[#EA580C]">{p.capacity}kW</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-[#888]">{p.systemType}</p>
                  <div className="my-3 h-px bg-[#f0e8e0]" />
                  <div className="space-y-1 text-xs text-[#555]">
                    <p>Panel Brand: {p.panelBrand}</p>
                    <p>Panel Watts: {p.panelWatts}W</p>
                    <p>Inverter: {p.inverterMake}</p>
                    {p.batteryKwh ? <p>Battery: {p.batteryKwh} kWh</p> : null}
                  </div>
                  <p className="mt-3 text-base font-bold">PKR {p.basePrice.toLocaleString()} <span className="text-xs font-normal text-[#888]">onwards</span></p>
                  <a href="#calculator" className="btn-white-orange mt-3 block rounded-lg px-3 py-2 text-center text-sm font-semibold">Get quote</a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="bg-[#FFF7ED] px-7 py-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">How it works</p>
          <h2 className="mt-1 text-2xl font-semibold">How easy it is to go solar</h2>
          <div className="relative mt-8 grid gap-6 md:grid-cols-4">
            <div className="absolute left-0 top-5 hidden h-[2px] w-full bg-[#EA580C]/30 md:block" />
            {[
              ["1", "Online quote", "Share your requirements and get an instant estimate."],
              ["2", "Site visit", "Our team performs a complete site assessment."],
              ["3", "Installation", "Certified installers 1-2 din me setup complete"],
              ["4", "Savings start", "Reduce electricity bills and start long-term savings."],
            ].map(([n, t, d], i) => (
              <div key={n} className="landing-fadeup relative" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EA580C] text-white">{n}</div>
                <p className="text-[13px] font-semibold">{t}</p>
                <p className="mt-1 text-[11px] text-[#888]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inverters" className="bg-white px-7 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">Brands we use</p>
          <h2 className="mt-1 text-2xl font-semibold">Certified inverter brands</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {inverterDetails.map((b, i) => {
              const lower = b.name.toLowerCase();
              const Icon = lower.includes("solis") ? Bolt : lower.includes("huawei") ? Cpu : lower.includes("growatt") ? PanelsTopLeft : BatteryCharging;
              return (
                <div key={b.name} className="landing-slideleft card-hover-orange rounded-[10px] border bg-[#f9fafb] p-4 text-center" style={{ animationDelay: `${i * 0.1}s`, borderColor: "#f0e8e0" }}>
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#FFF7ED] transition hover:scale-105"><Icon size={18} color="#EA580C" /></div>
                  <p className="text-[13px] font-semibold">{b.name}</p>
                  <p className="text-[11px] text-[#888]">{b.system}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="calculator" className="bg-[#1a1a1a] px-7 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#FDBA74]">Smart estimate</p>
          <h2 className="mt-1 text-2xl font-semibold">Interactive calculator & quotation builder</h2>
          <div className="mt-5 rounded-xl border border-[#333] bg-[#262626] p-5">
            <div className="mb-3 grid gap-3 md:grid-cols-5">
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Monthly Bill (PKR)</p>
                <input type="number" className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" placeholder="Monthly bill (PKR)" value={monthlyBill} onChange={(e) => setMonthlyBill(Number(e.target.value) || 0)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">City</p>
                <input className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" placeholder="City" value={leadCity} onChange={(e) => setLeadCity(e.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Roof Size (sq ft)</p>
                <input type="number" className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" placeholder="Roof size (sq ft)" value={roofSize} onChange={(e) => setRoofSize(Number(e.target.value) || 0)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Backup Hours</p>
                <input type="number" className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" placeholder="Backup hours" value={backupHours} onChange={(e) => setBackupHours(Number(e.target.value) || 0)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Battery Requirement</p>
                <label className="flex h-10 items-center gap-2 rounded border border-[#444] bg-[#1a1a1a] px-3 text-sm text-white">
                  <input type="checkbox" checked={needBattery} onChange={(e) => setNeedBattery(e.target.checked)} />
                  Battery required
                </label>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-[#bbb]">System Type</p>
                <select className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" value={systemType} onChange={(e) => setSystemType(e.target.value)}>{systemTypeOptions.map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Capacity (kW)</p>
                <select className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" value={capacityKw} onChange={(e) => setCapacityKw(Number(e.target.value))}>{capacityOptions.map((c) => <option key={c} value={c}>{c} kW</option>)}</select>
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Panel Brand</p>
                <select className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" value={panelBrand} onChange={(e) => setPanelBrand(e.target.value)}>
                  {panelBrandOptions.map((b) => (
                    <option key={b} value={b}>
                      {panelWattsMap[b] ? `${b} (${panelWattsMap[b]}W)` : b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-[10px] bg-[#EA580C] p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold">Estimated total cost</p>
                <p className="text-xs text-white/80">Includes installation, warranty & taxes</p>
                <p className="text-xs text-white/80">
                  Rate: PKR {(systemRatesByKw[systemType] || 0).toLocaleString()}/kW | {panelBrand}: PKR {(brandRatePerWatt[panelBrand] ?? brandRatePerWatt["Longi"] ?? 0).toLocaleString()}/W
                </p>
              </div>
              <p className={`text-2xl font-bold text-white transition-colors duration-300 ${pulse ? "price-pulse" : ""}`}>PKR {totalCost.toLocaleString()}</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-[#333] bg-[#262626] p-3">
                <p className="text-xs text-[#bbb]">Monthly bill savings</p>
                <p className="text-lg font-semibold">PKR {monthlySavings.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-[#333] bg-[#262626] p-3">
                <p className="text-xs text-[#bbb]">Estimated units/month</p>
                <p className="text-lg font-semibold">{estimatedUnits.toLocaleString()} units</p>
              </div>
              <div className="rounded-lg border border-[#333] bg-[#262626] p-3">
                <p className="text-xs text-[#bbb]">Estimated ROI</p>
                <p className="text-lg font-semibold">{roiYears} years</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#333] bg-[#1f1f1f] p-3">
              <p className="text-xs text-[#bbb]">Auto recommendation</p>
              <p className="text-sm text-white">
                Suggested package: <span className="font-semibold">{capacityKw} kW</span> |
                Estimated output: <span className="font-semibold">~{estimatedGenerationUnits} units/month</span> |
                Battery backup: <span className="font-semibold">{needBattery ? "Included" : "Not required"}</span>
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">
                Required kW: {capacityKw} | Panel count: {estimatedPanelCount} | Inverter size: {inverterSizeKw} kW
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">Matched package: {selectedPackage?.name || "No package found"}</p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Customer Name</p>
                <input className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" placeholder="Customer name" value={leadName} onChange={(e) => setLeadName(e.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-xs text-[#bbb]">Phone Number</p>
                <input className="h-10 w-full rounded border border-[#444] bg-[#1a1a1a] px-3 text-white" placeholder="Phone number" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleSaveLead} disabled={savingLead} className="rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c2410c] disabled:opacity-60">{savingLead ? "Saving..." : "Send lead to admin panel"}</button>
              <button onClick={handlePdf} className="rounded-lg border border-[#EA580C] px-4 py-2 text-sm font-semibold text-[#EA580C] hover:bg-[#EA580C] hover:text-white">Generate quotation PDF</button>
              <button onClick={handleWhatsApp} className="rounded-lg border border-[#25D366] px-4 py-2 text-sm font-semibold text-[#25D366] hover:bg-[#25D366] hover:text-white">Send on WhatsApp</button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-7 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">Smart Package Builder</p>
          <h2 className="mt-1 text-2xl font-semibold">Build your package in seconds</h2>
          <p className="mt-2 text-sm text-[#666]">Business can combine components and instantly create 3kW, 5kW, 10kW and commercial packages.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#f0e8e0] bg-[#f9fafb] p-4">
              <p className="text-sm font-semibold">Components in builder</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#444]">
                <p>Panels</p><p>Inverter</p>
                <p>Batteries</p><p>Structure</p>
                <p>Wiring</p><p>Labor</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#f0e8e0] bg-[#f9fafb] p-4">
              <p className="text-sm font-semibold">Current smart recommendation</p>
              <ul className="mt-3 space-y-1 text-sm text-[#444]">
                <li>Required kW: <span className="font-semibold text-[#1a1a1a]">{capacityKw} kW</span></li>
                <li>Panel count: <span className="font-semibold text-[#1a1a1a]">{estimatedPanelCount} panels</span> ({selectedPanelWatts}W each)</li>
                <li>Inverter size: <span className="font-semibold text-[#1a1a1a]">{inverterSizeKw} kW</span></li>
                <li>Estimated generation: <span className="font-semibold text-[#1a1a1a]">{estimatedGenerationUnits} units/month</span></li>
                <li>Estimated savings: <span className="font-semibold text-[#1a1a1a]">PKR {monthlySavings.toLocaleString()}/month</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="order-now" className="bg-[#FFF7ED] px-7 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">WhatsApp Order Section</p>
          <h2 className="mt-1 text-2xl font-semibold">Build your own order + live bill preview</h2>
          <p className="mt-2 text-sm text-[#666]">Customer selects panel brand, inverter brand, quantity and battery preference. Live preview updates instantly.</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#f0e8e0] bg-white p-4">
              <h3 className="text-lg font-semibold">Order builder</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-[#666]">Customer Name</p>
                  <input className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderCustomerName} onChange={(e) => setOrderCustomerName(e.target.value)} />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[#666]">Phone Number</p>
                  <input className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderCustomerPhone} onChange={(e) => setOrderCustomerPhone(e.target.value)} />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[#666]">Panel Brand</p>
                  <select className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderPanelBrand} onChange={(e) => setOrderPanelBrand(e.target.value)}>
                    {panelBrandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-xs text-[#666]">Inverter Brand</p>
                  <select className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderInverterBrand} onChange={(e) => setOrderInverterBrand(e.target.value)}>
                    {(inverterNames.length ? inverterNames : ["Growatt", "Solis", "Huawei", "Inverex"]).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-xs text-[#666]">Solar Panel Quantity</p>
                  <input type="number" className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderPanelQty} onChange={(e) => setOrderPanelQty(Math.max(1, Number(e.target.value) || 1))} />
                </div>
                <div>
                  <p className="mb-1 text-xs text-[#666]">Panel Watt (each)</p>
                  <input type="number" className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderPanelWatt} onChange={(e) => setOrderPanelWatt(Math.max(200, Number(e.target.value) || 550))} />
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex h-10 items-center gap-2 rounded border border-[#e5e7eb] px-3 text-sm">
                  <input type="checkbox" checked={orderWantBattery} onChange={(e) => setOrderWantBattery(e.target.checked)} />
                  Add battery
                </label>
                <div>
                  <p className="mb-1 text-xs text-[#666]">Battery Size (kWh)</p>
                  <input type="number" className="h-10 w-full rounded border border-[#e5e7eb] px-3" value={orderBatteryKwh} onChange={(e) => setOrderBatteryKwh(Math.max(1, Number(e.target.value) || 1))} disabled={!orderWantBattery} />
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-1 text-xs text-[#666]">Upload Electricity Bill (for future AI suggestion)</p>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm"
                  onChange={(e) => setOrderBillPhotoName(e.target.files?.[0]?.name || "")}
                />
                <p className="mt-1 text-xs text-[#888]">Current: manual inputs active. AI bill parsing is future module.</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#f0e8e0] bg-white p-4">
              <h3 className="text-lg font-semibold">Live bill preview</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Panel subtotal</span><span className="font-semibold">PKR {orderPanelSubtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Inverter subtotal</span><span className="font-semibold">PKR {orderInverterSubtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Battery subtotal</span><span className="font-semibold">PKR {orderBatterySubtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Structure + wiring + labor</span><span className="font-semibold">PKR {orderStructureWiringLabor.toLocaleString()}</span></div>
                <div className="mt-2 rounded-lg bg-[#EA580C] px-3 py-2 text-white">
                  <div className="flex justify-between"><span>Total Bill</span><span className="text-lg font-bold">PKR {orderGrandTotal.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-3 text-sm">
                <p className="font-semibold text-[#9A3412]">Smart suggestions</p>
                <p className="mt-1">Recommended inverter: <span className="font-semibold">{orderSuggestedInverter}</span> ({orderInverterSuggestedKw} kW)</p>
                <p>Recommended battery: <span className="font-semibold">{orderSuggestedBatteryKwh} kWh</span> for selected panel quantity</p>
                <p>Estimated system size: <span className="font-semibold">{orderSystemKw} kW</span></p>
              </div>

              <button onClick={handleOrderWhatsApp} className="mt-4 w-full rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
                Place Order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FFF7ED] px-7 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">Product Catalog / Shop</p>
          <h2 className="mt-1 text-2xl font-semibold">Optional e-commerce module</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["Products", "Panels, inverters, batteries and accessories catalog."],
              ["Cart & Checkout", "Simple cart, checkout flow and Cash on Delivery (COD)."],
              ["WhatsApp Orders & Stock", "Place order on WhatsApp and manage product stock in admin."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-[#f0e8e0] bg-white p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-[#666]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-7 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">AI Recommendation Engine (Future)</p>
          <h2 className="mt-1 text-2xl font-semibold">Upload bill, get instant smart suggestion</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-dashed border-[#f0e8e0] bg-[#f9fafb] p-4">
              <p className="text-sm font-semibold">Customer uploads</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-[#555]">
                <li>Electricity bill photo</li>
              </ul>
              <p className="mt-3 text-xs text-[#888]">Future module: OCR + AI parsing for faster conversion.</p>
            </div>
            <div className="rounded-xl border border-[#f0e8e0] bg-[#f9fafb] p-4">
              <p className="text-sm font-semibold">AI extracts & recommends</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-[#555]">
                <li>Consumed units</li>
                <li>Tariff / slab</li>
                <li>Suggested package size</li>
                <li>Expected savings & ROI</li>
              </ul>
              <p className="mt-3 text-xs font-medium text-[#EA580C]">High viral potential for lead generation.</p>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-white px-7 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-wider text-[#EA580C]">Testimonials</p>
          <h2 className="mt-1 text-2xl font-semibold">What our customers say</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["Ahmed Khan", "Lahore", "After installation, our bill dropped by more than half. The team was highly professional."],
              ["Sara Fatima", "Karachi", "The quotation was clear with no hidden charges. Installation was quick and smooth."],
              ["Mohammad Raza", "Islamabad", "The hybrid system performs perfectly. Backup and savings are both excellent."],
            ].map(([name, city, text], i) => (
              <div key={name} className="landing-fadeup rounded-xl border border-[#f0e8e0] bg-[#f9fafb] p-4" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-[#EA580C]">★★★★★</p>
                <p className="mt-2 text-sm text-[#444]">{text}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FED7AA] text-xs font-semibold text-[#9A3412]">{name.split(" ").map((n) => n[0]).join("")}</div>
                  <div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-[#888]">{city}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFF7ED] px-7 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, "10-year warranty", "Long-term warranty support for both panels and workmanship."],
            [Clock3, "1-2 day installation", "Fast deployment with trained technical team."],
            [Receipt, "Zero hidden costs", "Transparent pricing with clear scope and billing."],
          ].map(([Icon, title, desc]) => (
            <div key={title as string} className="card-hover-orange rounded-xl border border-[#f0e8e0] bg-white p-4 transition hover:-translate-y-[3px]">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FFF7ED] text-[#EA580C] transition hover:scale-110"><Icon size={18} /></div>
              <p className="text-sm font-semibold">{title as string}</p>
              <p className="mt-1 text-xs text-[#888]">{desc as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EA580C] px-7 py-12 text-center text-white">
        <h2 className="landing-fadeup text-[22px] font-semibold">Ready to switch to solar?</h2>
        <p className="landing-fadeup mt-2 text-[13px] text-white/80" style={{ animationDelay: "0.1s" }}>Book a free consultation or contact us directly on WhatsApp.</p>
        <div className="landing-fadeup mt-5 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.2s" }}>
          <a href="#calculator" className="btn-white-orange rounded-lg px-4 py-2 text-sm font-semibold">Book free consultation</a>
          <a href="https://wa.me/923464777625" target="_blank" rel="noreferrer" className="btn-white-orange rounded-lg px-4 py-2 text-sm font-semibold">Contact on WhatsApp</a>
        </div>
      </section>

      <footer id="contact" className="bg-[#1a1a1a] px-7 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-white"><span className="flex h-6 w-6 items-center justify-center rounded bg-[#EA580C]"><Sun size={12} /></span>SolarPro Pakistan</div>
          <div className="flex gap-4 text-[#666]"><a href="#packages" className="hover:text-[#EA580C]">Packages</a><a href="#calculator" className="hover:text-[#EA580C]">Calculator</a><a href="#contact" className="hover:text-[#EA580C]">Contact</a><a href="#" className="hover:text-[#EA580C]">Privacy</a></div>
          <p className="text-[#444]">© 2025 SolarPro Pakistan</p>
        </div>
      </footer>

      <a
        href="https://wa.me/923464777625"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
          <path d="M19.11 17.18c-.27-.13-1.6-.79-1.84-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.16-1.33-.8-.72-1.34-1.6-1.5-1.86-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.45-.61-.45h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26s.98 2.62 1.12 2.8c.13.18 1.92 2.93 4.66 4.11.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.82-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z"></path>
          <path d="M16.03 3.2C9.06 3.2 3.4 8.86 3.4 15.83c0 2.46.71 4.85 2.06 6.91L4.07 28.8l6.24-1.63a12.59 12.59 0 0 0 5.72 1.45h.01c6.97 0 12.63-5.66 12.63-12.63 0-3.38-1.32-6.56-3.72-8.95a12.52 12.52 0 0 0-8.92-3.84zm0 23.3h-.01a10.5 10.5 0 0 1-5.35-1.46l-.38-.22-3.7.97.99-3.6-.25-.37a10.48 10.48 0 0 1-1.61-5.62c0-5.8 4.72-10.52 10.52-10.52 2.81 0 5.45 1.09 7.44 3.08a10.45 10.45 0 0 1 3.09 7.44c0 5.8-4.72 10.52-10.52 10.52z"></path>
        </svg>
      </a>
    </div>
  );
}
