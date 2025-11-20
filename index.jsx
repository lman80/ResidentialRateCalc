import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Users, TrendingUp, DollarSign, AlertCircle, PieChart, Settings, ChevronDown, ChevronUp, Plus, Minus, Clock, Fuel, MapPin, Target, Trash2, Download, Upload } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon, isOpen, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200 font-medium text-gray-700"
  >
    <div className="flex items-center gap-2">
      <Icon size={20} className="text-blue-600" />
      <span>{title}</span>
    </div>
    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </button>
);

// Frequency Options and Multipliers
const FREQUENCIES = [
  { value: 'hourly', label: '/hr', toAnnual: (val, days) => val * days * 8 },
  { value: 'daily', label: '/day', toAnnual: (val, days) => val * days },
  { value: 'monthly', label: '/mo', toAnnual: (val) => val * 12 },
  { value: 'yearly', label: '/yr', toAnnual: (val) => val },
];

// --- COMPONENT: COMPOUND INPUT GROUP ---
const CompoundInputGroup = ({ label, items, onUpdate, workDays, wage }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total annual cost for this group
  const groupAnnualTotal = items.reduce((sum, item) => {
    const freqConfig = FREQUENCIES.find(f => f.value === item.freq);
    if (!freqConfig) return sum;
    
    let baseValue = item.value;
    if (item.unit === 'hours') {
       // If unit is hours, we multiply by the hourly wage to get dollar value
       baseValue = item.value * wage; 
    }
    return sum + freqConfig.toAnnual(baseValue, workDays);
  }, 0);

  // Handlers for manipulating the list
  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdate(newItems);
  };

  const addItem = () => {
    const newItem = { 
      id: Date.now(), 
      name: 'New Item', 
      value: 0, 
      freq: 'yearly', 
      unit: 'currency' 
    };
    onUpdate([...items, newItem]);
  };

  const removeItem = (id) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Header Row - Shows Label + Total Sum */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-2 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? <Minus size={14} className="text-blue-500" /> : <Plus size={14} className="text-slate-400" />}
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">${groupAnnualTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span className="text-xs text-gray-400">/yr</span>
        </div>
      </button>

      {/* Expanded List */}
      {isOpen && (
        <div className="bg-slate-50 p-3 space-y-3 rounded-lg mb-2 animate-in slide-in-from-top-1">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-y-2 gap-x-2 text-sm bg-white p-2 rounded shadow-sm border border-gray-200">
              
              {/* Name Input - Grows to fill available space */}
              <input 
                type="text" 
                value={item.name}
                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                className="flex-grow min-w-[140px] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-1 font-medium text-slate-700"
                placeholder="Item Name"
              />

              {/* Right side controls group - kept together to prevent awkward wrapping */}
              <div className="flex items-center gap-2 ml-auto">
                
                {/* Unit Selector ($ or Hrs) */}
                <div className="relative shrink-0">
                  <select
                    value={item.unit || 'currency'}
                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    className={`appearance-none font-bold border-none bg-transparent text-right w-10 focus:ring-0 cursor-pointer ${item.unit === 'hours' ? 'text-blue-600' : 'text-green-600'}`}
                  >
                    <option value="currency">$</option>
                    <option value="hours">Hr</option>
                  </select>
                </div>

                {/* Value Input */}
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleItemChange(item.id, 'value', parseFloat(e.target.value) || 0)}
                  className="w-20 text-right font-medium text-gray-900 border border-gray-200 rounded px-1 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  step="0.01"
                />

                {/* Frequency Selector */}
                <div className="relative shrink-0">
                  <select
                    value={item.freq}
                    onChange={(e) => handleItemChange(item.id, 'freq', e.target.value)}
                    className="appearance-none bg-gray-100 border border-gray-200 text-gray-600 py-1 pl-2 pr-6 rounded focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium w-[75px]"
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Delete Button */}
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={addItem}
            className="w-full py-2 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-500 hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Add Row to {label}
          </button>
        </div>
      )}
    </div>
  );
};

const InputRow = ({ label, data, onChange, className = "", children, readOnly = false, readOnlyText = "" }) => (
  <div className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm ${className}`}>
    <span className="text-gray-600 flex-1 mr-2">{label}</span>
    <div className="flex items-center gap-2">
      {children}
      {readOnly ? (
        <span className="font-bold text-slate-900 px-2 py-1 bg-gray-50 rounded border border-gray-200 min-w-[80px] text-right">
          {readOnlyText}
        </span>
      ) : (
        <>
           <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input
              type="number"
              value={data.value}
              onChange={(e) => onChange({ ...data, value: parseFloat(e.target.value) || 0 })}
              className="w-24 text-right font-medium text-gray-900 border rounded pl-4 pr-1 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
              step="0.01"
            />
          </div>
          <div className="relative">
            <select
              value={data.freq}
              onChange={(e) => onChange({ ...data, freq: e.target.value })}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 py-1 pl-2 pr-6 rounded focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium w-[70px]"
            >
              {FREQUENCIES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </>
      )}
    </div>
  </div>
);

export default function HvacCalculator() {
  // --- STATE MANAGEMENT ---
  const fileInputRef = useRef(null);

  // Global Settings
  const [numEmployees, setNumEmployees] = useState(1);
  const [utilizationRate, setUtilizationRate] = useState(65);
  const [workDays, setWorkDays] = useState(245);
  const [location, setLocation] = useState('WI');
  const [targetRate, setTargetRate] = useState(340);

  // 1. HOURLY WAGE & CORE TAXES (Simple Inputs)
  const [coreHourly, setCoreHourly] = useState({
    wage: { value: 30.00, freq: 'hourly', unit: 'currency' }, // Defaults from config file
    insurance: { value: 2.00, freq: 'hourly', unit: 'currency' }, 
  });

  // 2. BENEFITS & PERKS (Compound List)
  const [benefitsList, setBenefitsList] = useState({
    general: [
      { id: 1, name: 'Health Reimbursement', value: 1000, freq: 'monthly', unit: 'currency' },
      { id: 2, name: 'Paid Lunch', value: 1, freq: 'daily', unit: 'hours' },
      { id: 3, name: 'Investment Plan', value: 400, freq: 'monthly', unit: 'currency' },
      { id: 4, name: 'iPhone', value: 70, freq: 'monthly', unit: 'currency' },
      { id: 5, name: 'Snack Bar', value: 19.99, freq: 'daily', unit: 'currency' },
      { id: 6, name: 'Wife Perk', value: 49.96, freq: 'monthly', unit: 'currency' },
      { id: 7, name: 'Shop Upgrade Fund', value: 1.00, freq: 'hourly', unit: 'currency' },
    ]
  });

  // 3. VARIABLE OVERHEAD (Compound Lists)
  const [variableOverhead, setVariableOverhead] = useState({
    trucks: [
      { id: 1, name: 'Lease Payment', value: 3000, freq: 'yearly', unit: 'currency' },
      { id: 1763604728438, name: 'Bouncie Tracker', value: 10, freq: 'monthly', unit: 'currency' },
      { id: 1763604761322, name: 'Maintanance', value: 2000, freq: 'yearly', unit: 'currency' },
      { id: 1763604950237, name: 'Insurance', value: 100, freq: 'monthly', unit: 'currency' }
    ],
    tools: [{ id: 1, name: 'New Setup', value: 2000, freq: 'yearly', unit: 'currency' }],
    advertising: [{ id: 1, name: 'Ad Spend', value: 4000, freq: 'yearly', unit: 'currency' }],
    training: [{ id: 1, name: 'Certifications', value: 500, freq: 'yearly', unit: 'currency' }],
    uniforms: [{ id: 1, name: 'Shirts/Boots', value: 500, freq: 'yearly', unit: 'currency' }],
    consumables: [{ id: 1, name: 'Zip Ties/Tape', value: 10, freq: 'daily', unit: 'currency' }],
    warranty: [{ id: 1, name: 'Callback Fund', value: 0.5, freq: 'daily', unit: 'hours' }],
    other: [
      { id: 1, name: 'Vlog Editing', value: 4900, freq: 'yearly', unit: 'currency' },
      { id: 2, name: 'PTO Cost', value: 80, freq: 'yearly', unit: 'hours' },
      { id: 3, name: 'Paid Holidays', value: 48, freq: 'yearly', unit: 'hours' }
    ]
  });

  // Gas Calculator State
  const [gasParams, setGasParams] = useState({
    isOpen: false,
    milesPerDay: 80,
    mpg: 20,
    gasPrice: 4.00,
    annualCost: 3920.00
  });

  // 4. FIXED OVERHEAD (Compound Lists)
  const [fixedOverhead, setFixedOverhead] = useState({
    software: [
      { id: 1, name: 'Jobber', value: 360, freq: 'monthly', unit: 'currency' },
      { id: 1763604687857, name: 'QBO', value: 169, freq: 'monthly', unit: 'currency' },
      { id: 1763604697423, name: 'Google Emails', value: 50, freq: 'monthly', unit: 'currency' }
    ],
    rent: [{ id: 1, name: 'Shop Rent', value: 30000, freq: 'yearly', unit: 'currency' }],
    utilities: [{ id: 1, name: 'Gas, Electricity, Water, Wifi, Garbage', value: 1000, freq: 'monthly', unit: 'currency' }],
    professional: [
      { id: 1, name: 'Accountant', value: 10000, freq: 'yearly', unit: 'currency' },
      { id: 2, name: 'Bank Fees', value: 0, freq: 'yearly', unit: 'currency' },
      { id: 3, name: 'Licensing', value: 1000, freq: 'yearly', unit: 'currency' }
    ],
    insurance: [{ id: 1, name: 'Gen. Liability', value: 250, freq: 'monthly', unit: 'currency' }],
    office: [
      { id: 1, name: 'Postage', value: 1000, freq: 'yearly', unit: 'currency' },
      { id: 2, name: 'Supplies', value: 0, freq: 'yearly', unit: 'currency' },
      { id: 3, name: 'Janitorial', value: 0, freq: 'yearly', unit: 'currency' }
    ]
  });

  // UI State
  const [sectionsOpen, setSectionsOpen] = useState({
    hourly: true,
    variable: false,
    fixed: false,
  });

  const toggleSection = (key) => {
    setSectionsOpen(prev => ({...prev, [key]: !prev[key]}));
  };

  // --- EXPORT / IMPORT LOGIC ---
  const handleExport = () => {
    const data = {
      version: '1.0',
      numEmployees,
      utilizationRate,
      workDays,
      location,
      targetRate,
      coreHourly,
      benefitsList,
      variableOverhead,
      gasParams,
      fixedOverhead
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `hvac_config_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.numEmployees !== undefined) setNumEmployees(data.numEmployees);
        if (data.utilizationRate !== undefined) setUtilizationRate(data.utilizationRate);
        if (data.workDays !== undefined) setWorkDays(data.workDays);
        if (data.location) setLocation(data.location);
        if (data.targetRate !== undefined) setTargetRate(data.targetRate);
        if (data.coreHourly) setCoreHourly(data.coreHourly);
        if (data.benefitsList) setBenefitsList(data.benefitsList);
        if (data.variableOverhead) setVariableOverhead(data.variableOverhead);
        if (data.gasParams) setGasParams(data.gasParams);
        if (data.fixedOverhead) setFixedOverhead(data.fixedOverhead);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };


  // --- EFFECT: AUTO-CALCULATE GAS ---
  useEffect(() => {
    const dailyCost = (gasParams.milesPerDay / gasParams.mpg) * gasParams.gasPrice;
    const annualCost = dailyCost * workDays;
    setGasParams(p => ({...p, annualCost: annualCost }));
  }, [gasParams.milesPerDay, gasParams.mpg, gasParams.gasPrice, workDays]);


  // --- HELPER: Get Annual Cost from Simple Item ---
  const getSimpleAnnual = (item) => {
    const freqConfig = FREQUENCIES.find(f => f.value === item.freq);
    if (!freqConfig) return 0;
    let baseValue = item.value;
    if (item.unit === 'hours') {
      const currentWage = coreHourly.wage.value; 
      baseValue = item.value * currentWage;
    }
    return freqConfig.toAnnual(baseValue, workDays);
  };

  // --- HELPER: Get Annual Cost from Compound List ---
  const getCompoundAnnual = (items) => {
    return items.reduce((sum, item) => {
      const freqConfig = FREQUENCIES.find(f => f.value === item.freq);
      if (!freqConfig) return sum;
      let baseValue = item.value;
      if (item.unit === 'hours') {
         baseValue = item.value * coreHourly.wage.value; 
      }
      return sum + freqConfig.toAnnual(baseValue, workDays);
    }, 0);
  };

  // --- CALCULATIONS ---

  // 1. Time
  const hoursPerDay = 8;
  const totalAnnualHours = workDays * hoursPerDay;
  const billableHours = totalAnnualHours * (utilizationRate / 100);
  
  // 2. Labor & Benefits
  const annualWage = getSimpleAnnual(coreHourly.wage);
  const annualInsurance = getSimpleAnnual(coreHourly.insurance);
  
  // FICA & Unemployment
  const annualFica = annualWage * 0.0765;
  const hourlyFicaDisplay = (annualFica / totalAnnualHours).toFixed(2);
  const annualUnemployment = location === 'WI' ? 430 : 507.93;

  // Compound Benefits
  const annualBenefitsTotal = getCompoundAnnual(benefitsList.general);
  const hourlyBenefitsTotal = annualBenefitsTotal / totalAnnualHours;

  const totalAnnualLaborCost = annualWage + annualFica + annualUnemployment + annualInsurance + annualBenefitsTotal;
  const totalHourlyBurden = totalAnnualLaborCost / totalAnnualHours;

  // 3. Variable Overhead Total
  const totalAnnualVariablePerEmp = 
    Object.values(variableOverhead).reduce((sum, list) => sum + getCompoundAnnual(list), 0) + gasParams.annualCost;

  // 4. Fixed Overhead Total
  const totalAnnualFixedCompany = 
    Object.values(fixedOverhead).reduce((sum, list) => sum + getCompoundAnnual(list), 0);
  
  const fixedCostAllocatedPerEmp = totalAnnualFixedCompany / numEmployees;

  // 5. Grand Totals
  const totalAnnualCostPerEmp = totalAnnualLaborCost + totalAnnualVariablePerEmp + fixedCostAllocatedPerEmp;
  const hourlyCostToBusiness = totalAnnualCostPerEmp / totalAnnualHours;
  const breakEvenRate = totalAnnualCostPerEmp / billableHours;

  // 6. Margin
  const profitPerHour = targetRate - breakEvenRate;
  const profitMargin = targetRate > 0 ? (profitPerHour / targetRate) * 100 : 0;
  
  let marginColor = "text-red-600";
  let barColor = "bg-red-500";
  if (profitMargin >= 20) {
    marginColor = "text-emerald-600";
    barColor = "bg-emerald-500";
  } else if (profitMargin > 0) {
    marginColor = "text-amber-500";
    barColor = "bg-amber-500";
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calculator className="text-blue-600" size={32} />
              HVAC Tech Profitability
            </h1>
            <div className="flex items-center gap-3 mt-1">
                <p className="text-slate-500">Analyze costs, overhead, and profit margins.</p>
                
                {/* EXPORT / IMPORT BUTTONS */}
                <div className="flex gap-2 ml-2">
                    <button 
                        onClick={handleExport} 
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        title="Download current data"
                    >
                        <Download size={14} /> Export Data
                    </button>
                    <button 
                        onClick={() => fileInputRef.current.click()} 
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        title="Upload saved data"
                    >
                        <Upload size={14} /> Import Data
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImport} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            </div>
          </div>
          
          {/* TOP LEVEL CONTROLS */}
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Work Days/Yr</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={workDays} 
                  onChange={(e) => setWorkDays(parseInt(e.target.value) || 0)}
                  className="w-24 font-bold text-slate-900 bg-slate-50 border rounded px-2 py-1"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Techs</label>
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                <button onClick={() => setNumEmployees(Math.max(1, numEmployees - 1))} className="p-2 hover:bg-white rounded-md shadow-sm transition-all"><ChevronDown size={16}/></button>
                <span className="font-bold w-8 text-center">{numEmployees}</span>
                <button onClick={() => setNumEmployees(numEmployees + 1)} className="p-2 hover:bg-white rounded-md shadow-sm transition-all"><ChevronUp size={16}/></button>
              </div>
            </div>
            
            <div className="flex flex-col w-48">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Utilization: {utilizationRate}%
              </label>
              <input 
                type="range" 
                min="30" 
                max="100" 
                value={utilizationRate} 
                onChange={(e) => setUtilizationRate(parseInt(e.target.value))}
                className="h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Worst (50%)</span>
                <span>Norm (75%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* 1. HOURLY & BENEFITS */}
            <Card className="overflow-hidden">
              <SectionHeader 
                title="Wages & Benefits" 
                icon={DollarSign} 
                isOpen={sectionsOpen.hourly} 
                onClick={() => toggleSection('hourly')}
              />
              {sectionsOpen.hourly && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                  {/* Simple Inputs */}
                  <InputRow label="Hourly Rate" data={coreHourly.wage} onChange={(v) => setCoreHourly(p => ({...p, wage: v}))} />
                  <InputRow label="Insurance" data={coreHourly.insurance} onChange={(v) => setCoreHourly(p => ({...p, insurance: v}))} />
                  
                  {/* Read Only Taxes */}
                  <InputRow label="FICA Tax (7.65%)" readOnly={true} readOnlyText={`$${hourlyFicaDisplay}/hr`} />
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-600 flex-1 mr-2 flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> State</span>
                    <div className="relative">
                      <select value={location} onChange={(e) => setLocation(e.target.value)} className="bg-blue-50 border border-blue-200 text-blue-700 py-1 px-2 rounded font-bold text-sm outline-none">
                        <option value="WI">WI ($430/yr)</option>
                        <option value="IL">IL ($508/yr)</option>
                      </select>
                    </div>
                  </div>

                  {/* Compound Benefits List */}
                  <div className="mt-4 pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Custom Benefits & Perks</h4>
                    <CompoundInputGroup 
                      label="Benefits List" 
                      items={benefitsList.general} 
                      onUpdate={(items) => setBenefitsList({ general: items })} 
                      workDays={workDays}
                      wage={coreHourly.wage.value}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-slate-700 text-sm">
                    <span>Labor Subtotal (Hourly)</span>
                    <span>${totalHourlyBurden.toFixed(2)} /hr</span>
                  </div>
                </div>
              )}
            </Card>

            {/* 2. VARIABLE OVERHEAD */}
            <Card className="overflow-hidden">
              <SectionHeader 
                title="Variable Overhead" 
                icon={TrendingUp} 
                isOpen={sectionsOpen.variable} 
                onClick={() => toggleSection('variable')}
              />
              {sectionsOpen.variable && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                  <div className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded">Costs tied to each employee. Add multiple items per category.</div>
                  
                  <CompoundInputGroup label="Trucks" items={variableOverhead.trucks} onUpdate={(i) => setVariableOverhead(p => ({...p, trucks: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  <CompoundInputGroup label="Tools" items={variableOverhead.tools} onUpdate={(i) => setVariableOverhead(p => ({...p, tools: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  
                  {/* Special Gas Calculator */}
                   <div className="border-b border-gray-100 py-3 px-2">
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 font-medium text-sm text-slate-700">
                          <Fuel size={14} className="text-blue-500"/>
                          <span>Gas Calculator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">${gasParams.annualCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                          <span className="text-xs text-gray-400">/yr</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-50 p-1 rounded">
                          <span className="block text-gray-400 text-[9px] uppercase font-bold">Miles/Day</span>
                          <input type="number" value={gasParams.milesPerDay} onChange={(e) => setGasParams(p=>({...p, milesPerDay: parseFloat(e.target.value)||0}))} className="w-full bg-transparent font-bold text-right outline-none" />
                        </div>
                        <div className="bg-slate-50 p-1 rounded">
                          <span className="block text-gray-400 text-[9px] uppercase font-bold">MPG</span>
                          <input type="number" value={gasParams.mpg} onChange={(e) => setGasParams(p=>({...p, mpg: parseFloat(e.target.value)||0}))} className="w-full bg-transparent font-bold text-right outline-none" />
                        </div>
                        <div className="bg-slate-50 p-1 rounded">
                          <span className="block text-gray-400 text-[9px] uppercase font-bold">$/Gal</span>
                          <input type="number" value={gasParams.gasPrice} onChange={(e) => setGasParams(p=>({...p, gasPrice: parseFloat(e.target.value)||0}))} className="w-full bg-transparent font-bold text-right outline-none" />
                        </div>
                     </div>
                   </div>

                  <CompoundInputGroup label="Uniforms" items={variableOverhead.uniforms} onUpdate={(i) => setVariableOverhead(p => ({...p, uniforms: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  <CompoundInputGroup label="Consumables" items={variableOverhead.consumables} onUpdate={(i) => setVariableOverhead(p => ({...p, consumables: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  <CompoundInputGroup label="Warranty" items={variableOverhead.warranty} onUpdate={(i) => setVariableOverhead(p => ({...p, warranty: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  <CompoundInputGroup label="Training" items={variableOverhead.training} onUpdate={(i) => setVariableOverhead(p => ({...p, training: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  <CompoundInputGroup label="Advertising" items={variableOverhead.advertising} onUpdate={(i) => setVariableOverhead(p => ({...p, advertising: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                  <CompoundInputGroup label="Other (PTO/Vlog)" items={variableOverhead.other} onUpdate={(i) => setVariableOverhead(p => ({...p, other: i}))} workDays={workDays} wage={coreHourly.wage.value} />

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-slate-700 text-sm">
                    <span>Annual Variable Total</span>
                    <span>${totalAnnualVariablePerEmp.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* 3. FIXED OVERHEAD */}
            <Card className="overflow-hidden">
              <SectionHeader 
                title="Fixed Overhead" 
                icon={Settings} 
                isOpen={sectionsOpen.fixed} 
                onClick={() => toggleSection('fixed')}
              />
              {sectionsOpen.fixed && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                   <div className="text-xs text-gray-500 mb-3 bg-orange-50 p-2 rounded">Total company costs (divided by # of techs).</div>
                   
                   <CompoundInputGroup label="Software" items={fixedOverhead.software} onUpdate={(i) => setFixedOverhead(p => ({...p, software: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                   <CompoundInputGroup label="Rent" items={fixedOverhead.rent} onUpdate={(i) => setFixedOverhead(p => ({...p, rent: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                   <CompoundInputGroup label="Utilities" items={fixedOverhead.utilities} onUpdate={(i) => setFixedOverhead(p => ({...p, utilities: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                   <CompoundInputGroup label="Professional Fees" items={fixedOverhead.professional} onUpdate={(i) => setFixedOverhead(p => ({...p, professional: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                   <CompoundInputGroup label="Insurance (GL)" items={fixedOverhead.insurance} onUpdate={(i) => setFixedOverhead(p => ({...p, insurance: i}))} workDays={workDays} wage={coreHourly.wage.value} />
                   <CompoundInputGroup label="Office & Janitorial" items={fixedOverhead.office} onUpdate={(i) => setFixedOverhead(p => ({...p, office: i}))} workDays={workDays} wage={coreHourly.wage.value} />

                  <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Total Fixed Company</span>
                      <span>${totalAnnualFixedCompany.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-700 text-sm">
                      <span>Share Per Tech</span>
                      <span>${fixedCostAllocatedPerEmp.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

          </div>

          {/* RIGHT COLUMN: DASHBOARD */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* BIG NUMBER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* BREAK EVEN RATE CARD */}
              <Card className="p-6 bg-white border-2 border-slate-800 text-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-900"><DollarSign size={100} /></div>
                <h3 className="text-slate-600 text-sm font-bold uppercase tracking-wider">Break-Even Rate</h3>
                <div className="text-5xl font-extrabold mt-2 text-black">${breakEvenRate.toFixed(2)}<span className="text-lg font-semibold text-slate-500">/hr</span></div>
                <div className="mt-4 text-sm text-slate-700 bg-slate-100 inline-block px-3 py-1 rounded-full font-medium">
                  At {utilizationRate}% Utilization ({Math.round(billableHours)} billable hrs)
                </div>
              </Card>

              {/* TOTAL COST CARD */}
              <Card className="p-6 bg-white border-2 border-blue-600 text-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Users size={100} /></div>
                <h3 className="text-blue-600 text-sm font-bold uppercase tracking-wider">Total Cost Per Tech</h3>
                <div className="text-4xl font-extrabold mt-2 text-black">${totalAnnualCostPerEmp.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                 <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <div className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded text-xs">
                    ${hourlyCostToBusiness.toFixed(2)} / clock hr
                  </div>
                  <span>(Burdened cost to business)</span>
                </div>
              </Card>
            </div>

            {/* SUMMARY CHART */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChart size={20} className="text-slate-400" />
                Annual Cost Breakdown
              </h3>
              
              <div className="space-y-6">
                {/* Bar Chart Representation */}
                <div className="h-8 w-full bg-gray-100 rounded-full flex overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(totalAnnualLaborCost / totalAnnualCostPerEmp) * 100}%` }}></div>
                  <div className="h-full bg-amber-500" style={{ width: `${(totalAnnualVariablePerEmp / totalAnnualCostPerEmp) * 100}%` }}></div>
                  <div className="h-full bg-indigo-500" style={{ width: `${(fixedCostAllocatedPerEmp / totalAnnualCostPerEmp) * 100}%` }}></div>
                </div>
                
                {/* Legend & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-l-4 border-emerald-500 pl-3">
                    <div className="text-xs text-gray-500 uppercase">Labor & Benefits</div>
                    <div className="text-xl font-bold text-gray-800">${totalAnnualLaborCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-400">{((totalAnnualLaborCost / totalAnnualCostPerEmp) * 100).toFixed(1)}%</div>
                  </div>
                  
                  <div className="border-l-4 border-amber-500 pl-3">
                    <div className="text-xs text-gray-500 uppercase">Variable Overhead</div>
                    <div className="text-xl font-bold text-gray-800">${totalAnnualVariablePerEmp.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-400">{((totalAnnualVariablePerEmp / totalAnnualCostPerEmp) * 100).toFixed(1)}%</div>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-3">
                    <div className="text-xs text-gray-500 uppercase">Fixed Overhead Share</div>
                    <div className="text-xl font-bold text-gray-800">${fixedCostAllocatedPerEmp.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-400">{((fixedCostAllocatedPerEmp / totalAnnualCostPerEmp) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* PROFITABILITY & PRICING SIMULATOR */}
            <Card className="p-6 bg-white border-2 border-indigo-100">
              <div className="flex items-center gap-2 mb-6 text-indigo-900">
                <Target size={24} className="text-indigo-600" />
                <h3 className="text-lg font-bold">Profitability & Pricing Calculator</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Suggested Pricing */}
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Target 20% Margin</h4>
                  <div className="text-sm text-indigo-800 mb-3">Recommended hourly rate to achieve a 20% Net Profit Margin:</div>
                  <div className="text-4xl font-bold text-indigo-900">
                    ${(breakEvenRate / 0.8).toFixed(2)}<span className="text-lg font-normal text-indigo-400">/hr</span>
                  </div>
                </div>

                {/* Right: Custom Scenario */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-2 uppercase tracking-wide">Set Your Hourly Rate</label>
                  <div className="relative max-w-[240px] mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                    <input
                      type="number"
                      value={targetRate}
                      onChange={(e) => setTargetRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-4 py-3 text-3xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">/hr</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Net Profit / Hour</span>
                      <span className={`font-bold text-lg ${profitPerHour > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                        ${profitPerHour.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Net Profit Margin</span>
                      <span className={`text-2xl font-black ${marginColor}`}>
                        {profitMargin.toFixed(1)}%
                      </span>
                    </div>
                    {/* Progress Bar visual */}
                     <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                          style={{width: `${Math.max(0, Math.min(100, profitMargin * 2.5))}%`}} // Scaled for visual effect
                        />
                     </div>
                     <div className="text-xs text-gray-400 text-right pt-1">Target: 20%</div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
