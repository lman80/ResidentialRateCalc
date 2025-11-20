import React, { useState, useEffect } from 'react';
import { Calculator, Users, TrendingUp, DollarSign, AlertCircle, PieChart, Settings, ChevronDown, ChevronUp, Plus, Minus, Clock, Fuel, MapPin, Target } from 'lucide-react';

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

// Unit Options
const UNITS = [
  { value: 'currency', label: '$', icon: DollarSign },
  { value: 'hours', label: 'Hrs', icon: Clock },
];

const InputRow = ({ label, data, onChange, className = "", children, readOnly = false, readOnlyText = "" }) => (
  <div className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm ${className}`}>
    <span className="text-gray-600 flex-1 mr-2">{label}</span>
    <div className="flex items-center gap-2">
      
      {/* Optional children (like extra buttons) */}
      {children}

      {readOnly ? (
        <span className="font-bold text-slate-900 px-2 py-1 bg-gray-50 rounded border border-gray-200 min-w-[80px] text-right">
          {readOnlyText}
        </span>
      ) : (
        <>
          {/* Unit Selector ($ or Hrs) */}
          <div className="relative">
            <select
              value={data.unit || 'currency'}
              onChange={(e) => onChange({ ...data, unit: e.target.value })}
              className={`appearance-none font-bold border-none bg-transparent text-right w-8 focus:ring-0 cursor-pointer ${data.unit === 'hours' ? 'text-blue-600' : 'text-green-600'}`}
            >
              <option value="currency">$</option>
              <option value="hours">Hr</option>
            </select>
          </div>

          {/* Value Input */}
          <input
            type="number"
            value={data.value}
            onChange={(e) => onChange({ ...data, value: parseFloat(e.target.value) || 0 })}
            className="w-20 text-right font-medium text-gray-900 border rounded px-1 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
            step="0.01"
          />

          {/* Frequency Selector */}
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
  
  // Global Settings
  const [numEmployees, setNumEmployees] = useState(1);
  const [utilizationRate, setUtilizationRate] = useState(65);
  const [workDays, setWorkDays] = useState(245);
  const [location, setLocation] = useState('WI'); // 'WI' or 'IL'
  
  // Pricing Simulator State
  const [targetRate, setTargetRate] = useState(340);

  // Hourly Breakdown Data (Value + Frequency + Unit)
  const [hourlyData, setHourlyData] = useState({
    wage: { value: 50.00, freq: 'hourly', unit: 'currency' },
    insurance: { value: 12.00, freq: 'hourly', unit: 'currency' }, 
    healthReimb: { value: 6.12, freq: 'hourly', unit: 'currency' },
    lunch: { value: 6.25, freq: 'hourly', unit: 'currency' },
    fidelity: { value: 2.45, freq: 'hourly', unit: 'currency' },
    iphone: { value: 0.43, freq: 'hourly', unit: 'currency' },
    snacks: { value: 2.50, freq: 'hourly', unit: 'currency' },
    wifePerk: { value: 0.24, freq: 'hourly', unit: 'currency' },
    shopAmenity: { value: 1.00, freq: 'hourly', unit: 'currency' },
    toolMaintenance: { value: 1.00, freq: 'hourly', unit: 'currency' },
  });

  // Variable Annual Costs
  const [variableData, setVariableData] = useState({
    trucks: { value: 3000, freq: 'yearly', unit: 'currency' },
    tools: { value: 2000, freq: 'yearly', unit: 'currency' },
    gas: { value: 800, freq: 'yearly', unit: 'currency' },
    advertising: { value: 4000, freq: 'yearly', unit: 'currency' },
    vlogEditing: { value: 4900, freq: 'yearly', unit: 'currency' },
    pto: { value: 8000, freq: 'yearly', unit: 'currency' },
    paidHolidays: { value: 4800, freq: 'yearly', unit: 'currency' },
    // New Items
    uniforms: { value: 0, freq: 'yearly', unit: 'currency' },
    consumables: { value: 0, freq: 'yearly', unit: 'currency' },
    warranty: { value: 0, freq: 'yearly', unit: 'currency' },
    training: { value: 0, freq: 'yearly', unit: 'currency' },
  });

  // Gas Calculator State
  const [gasParams, setGasParams] = useState({
    isOpen: false,
    milesPerDay: 80,
    mpg: 15,
    gasPrice: 3.50
  });

  // Fixed Annual Costs
  const [fixedData, setFixedData] = useState({
    software: { value: 6000, freq: 'yearly', unit: 'currency' },
    rent: { value: 30000, freq: 'yearly', unit: 'currency' },
    postage: { value: 1000, freq: 'yearly', unit: 'currency' },
    accountant: { value: 10000, freq: 'yearly', unit: 'currency' },
    // New Items
    glInsurance: { value: 0, freq: 'yearly', unit: 'currency' },
    shopUtilities: { value: 0, freq: 'yearly', unit: 'currency' },
    officeSupplies: { value: 0, freq: 'yearly', unit: 'currency' },
    bankFees: { value: 0, freq: 'yearly', unit: 'currency' },
    licensing: { value: 0, freq: 'yearly', unit: 'currency' },
    janitorial: { value: 0, freq: 'yearly', unit: 'currency' },
  });

  // UI State
  const [sectionsOpen, setSectionsOpen] = useState({
    hourly: true,
    variable: false,
    fixed: false,
    benefitsDetail: true
  });

  const toggleSection = (key) => {
    setSectionsOpen(prev => ({...prev, [key]: !prev[key]}));
  };

  // --- EFFECT: AUTO-CALCULATE GAS ---
  useEffect(() => {
    if (gasParams.isOpen) {
      const dailyCost = (gasParams.milesPerDay / gasParams.mpg) * gasParams.gasPrice;
      const annualCost = dailyCost * workDays;
      setVariableData(prev => ({
        ...prev,
        gas: { value: parseFloat(annualCost.toFixed(2)), freq: 'yearly', unit: 'currency' }
      }));
    }
  }, [gasParams.milesPerDay, gasParams.mpg, gasParams.gasPrice, gasParams.isOpen, workDays]);


  // --- CALCULATIONS ---

  // 1. Time
  const hoursPerDay = 8;
  const totalAnnualHours = workDays * hoursPerDay;
  const billableHours = totalAnnualHours * (utilizationRate / 100);
  
  // Helper to convert any item to Annual Cost
  const getAnnualCost = (item) => {
    const freqConfig = FREQUENCIES.find(f => f.value === item.freq);
    if (!freqConfig) return 0;

    let baseValue = item.value;
    
    if (item.unit === 'hours') {
      const currentWage = hourlyData.wage.unit === 'currency' ? hourlyData.wage.value : 0;
      baseValue = item.value * currentWage;
    }

    return freqConfig.toAnnual(baseValue, workDays);
  };

  // 2. Hourly Costs & Wages
  const annualWage = getAnnualCost(hourlyData.wage);

  // --- NEW FICA CALCULATION (7.65% Flat) ---
  const annualFica = annualWage * 0.0765;
  const hourlyFicaDisplay = (annualFica / totalAnnualHours).toFixed(2);

  // --- STATE UNEMPLOYMENT INSURANCE ---
  const annualUnemployment = location === 'WI' ? 430 : 507.93;
  
  // Benefits
  const benefitsList = [
    'healthReimb', 'lunch', 'fidelity', 'iphone', 
    'snacks', 'wifePerk', 'shopAmenity', 'toolMaintenance'
  ];
  
  const annualInsurance = getAnnualCost(hourlyData.insurance);
  const annualBenefitsTotal = benefitsList.reduce((sum, key) => sum + getAnnualCost(hourlyData[key]), 0);
  const hourlyBenefitsTotal = annualBenefitsTotal / totalAnnualHours;

  // Total Labor Cost (Wage + FICA + Unemployment + Insurance + General Benefits)
  const totalAnnualLaborCost = annualWage + annualFica + annualUnemployment + annualInsurance + annualBenefitsTotal;
  const totalHourlyBurden = totalAnnualLaborCost / totalAnnualHours;

  // 3. Variable Costs
  const totalAnnualVariablePerEmp = Object.values(variableData).reduce((sum, item) => sum + getAnnualCost(item), 0);
  
  // 4. Fixed Costs
  const totalAnnualFixedCompany = Object.values(fixedData).reduce((sum, item) => sum + getAnnualCost(item), 0);
  const fixedCostAllocatedPerEmp = totalAnnualFixedCompany / numEmployees;

  // 5. Grand Totals
  const totalAnnualCostPerEmp = totalAnnualLaborCost + totalAnnualVariablePerEmp + fixedCostAllocatedPerEmp;
  const hourlyCostToBusiness = totalAnnualCostPerEmp / totalAnnualHours;
  const breakEvenRate = totalAnnualCostPerEmp / billableHours;

  // 6. Margin Calculations
  const profitPerHour = targetRate - breakEvenRate;
  const profitMargin = targetRate > 0 ? (profitPerHour / targetRate) * 100 : 0;
  
  // Determine visual color for margin
  let marginColor = "text-red-600";
  let barColor = "bg-red-500";
  if (profitMargin >= 20) {
    marginColor = "text-emerald-600";
    barColor = "bg-emerald-500";
  } else if (profitMargin > 0) {
    marginColor = "text-amber-500";
    barColor = "bg-amber-500";
  }

  // --- HANDLERS ---
  const updateHourly = (key, val) => setHourlyData(prev => ({...prev, [key]: val}));
  const updateVariable = (key, val) => setVariableData(prev => ({...prev, [key]: val}));
  const updateFixed = (key, val) => setFixedData(prev => ({...prev, [key]: val}));

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
            <p className="text-slate-500 mt-1">Analyze costs, overhead, and calculate your break-even rate.</p>
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
            
            {/* HOURLY INPUTS */}
            <Card className="overflow-hidden">
              <SectionHeader 
                title="Wages & Perks" 
                icon={DollarSign} 
                isOpen={sectionsOpen.hourly} 
                onClick={() => toggleSection('hourly')}
              />
              {sectionsOpen.hourly && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                  <InputRow label="Hourly Rate" data={hourlyData.wage} onChange={(v) => updateHourly('wage', v)} />
                  
                  {/* READ ONLY FICA */}
                  <InputRow 
                    label="FICA Tax (7.65%)" 
                    readOnly={true} 
                    readOnlyText={`$${hourlyFicaDisplay}/hr`} 
                  />

                  {/* STATE SELECTOR */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-600 flex-1 mr-2 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400"/> Employer State
                    </span>
                    <div className="relative">
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="appearance-none bg-blue-50 border border-blue-200 text-blue-700 py-1 pl-3 pr-8 rounded font-bold focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      >
                        <option value="WI">Wisconsin</option>
                        <option value="IL">Illinois</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* UNEMPLOYMENT INSURANCE */}
                  <InputRow 
                    label="Unemployment Ins." 
                    readOnly={true} 
                    readOnlyText={`$${annualUnemployment}/yr`} 
                  />

                  <InputRow label="Insurance" data={hourlyData.insurance} onChange={(v) => updateHourly('insurance', v)} />
                  
                  {/* GENERAL BENEFITS DROPDOWN SECTION */}
                  <div className="py-2 border-b border-gray-100">
                    <button 
                      onClick={() => toggleSection('benefitsDetail')}
                      className="w-full flex items-center justify-between text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors py-1"
                    >
                      <div className="flex items-center gap-2">
                        {sectionsOpen.benefitsDetail ? <Minus size={12} /> : <Plus size={12} />}
                        <span>General Benefits (Total)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-xs">$</span>
                        <span className="text-right font-bold text-slate-900 px-1">
                          {hourlyBenefitsTotal.toFixed(2)} <span className="text-xs font-normal text-gray-400">/hr eq.</span>
                        </span>
                      </div>
                    </button>

                    {sectionsOpen.benefitsDetail && (
                      <div className="mt-2 pl-2 border-l-2 border-slate-100 space-y-0 animate-in slide-in-from-top-1 duration-200">
                        <InputRow className="border-none py-1" label="Health Reimbursement" data={hourlyData.healthReimb} onChange={(v) => updateHourly('healthReimb', v)} />
                        <InputRow className="border-none py-1" label="Paid Lunch" data={hourlyData.lunch} onChange={(v) => updateHourly('lunch', v)} />
                        <InputRow className="border-none py-1" label="Investment Plan" data={hourlyData.fidelity} onChange={(v) => updateHourly('fidelity', v)} />
                        <InputRow className="border-none py-1" label="iPhone" data={hourlyData.iphone} onChange={(v) => updateHourly('iphone', v)} />
                        <InputRow className="border-none py-1" label="Snack Bar" data={hourlyData.snacks} onChange={(v) => updateHourly('snacks', v)} />
                        <InputRow className="border-none py-1" label="Wife Perk" data={hourlyData.wifePerk} onChange={(v) => updateHourly('wifePerk', v)} />
                        <InputRow className="border-none py-1" label="Shop Upgrade Fund" data={hourlyData.shopAmenity} onChange={(v) => updateHourly('shopAmenity', v)} />
                        <InputRow className="border-none py-1" label="Tool Maint." data={hourlyData.toolMaintenance} onChange={(v) => updateHourly('toolMaintenance', v)} />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-slate-700 text-sm">
                    <span>Labor Subtotal (Hourly)</span>
                    <span>${totalHourlyBurden.toFixed(2)} /hr</span>
                  </div>
                </div>
              )}
            </Card>

            {/* VARIABLE OVERHEAD */}
            <Card className="overflow-hidden">
              <SectionHeader 
                title="Variable Overhead" 
                icon={TrendingUp} 
                isOpen={sectionsOpen.variable} 
                onClick={() => toggleSection('variable')}
              />
              {sectionsOpen.variable && (
                <div className="p-4 bg-white animate-in slide-in-from-top-2 duration-200">
                  <div className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded">Costs tied to each employee.</div>
                  <InputRow label="Truck Lease" data={variableData.trucks} onChange={(v) => updateVariable('trucks', v)} />
                  <InputRow label="Tools (Setup)" data={variableData.tools} onChange={(v) => updateVariable('tools', v)} />
                  
                  {/* GAS SECTION WITH CALCULATOR */}
                  <div className="bg-slate-50 rounded-lg my-1">
                    <InputRow 
                      label="Gas" 
                      data={variableData.gas} 
                      onChange={(v) => updateVariable('gas', v)} 
                      className="bg-transparent"
                    >
                      <button 
                        onClick={() => setGasParams(p => ({...p, isOpen: !p.isOpen}))}
                        className={`p-1 rounded transition-colors ${gasParams.isOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                        title="Gas Cost Calculator"
                      >
                        <Fuel size={16} />
                      </button>
                    </InputRow>

                    {gasParams.isOpen && (
                      <div className="px-4 pb-3 pt-1 border-b border-gray-100 text-sm animate-in slide-in-from-top-1">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase">Miles/Day</label>
                            <input 
                              type="number" 
                              value={gasParams.milesPerDay}
                              onChange={(e) => setGasParams(p => ({...p, milesPerDay: parseFloat(e.target.value) || 0}))}
                              className="w-full border rounded p-1 text-right font-medium text-slate-700 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase">MPG</label>
                            <input 
                              type="number" 
                              value={gasParams.mpg}
                              onChange={(e) => setGasParams(p => ({...p, mpg: parseFloat(e.target.value) || 1}))}
                              className="w-full border rounded p-1 text-right font-medium text-slate-700 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase">$/Gal</label>
                            <input 
                              type="number" 
                              value={gasParams.gasPrice}
                              onChange={(e) => setGasParams(p => ({...p, gasPrice: parseFloat(e.target.value) || 0}))}
                              className="w-full border rounded p-1 text-right font-medium text-slate-700 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 text-center bg-blue-50 rounded py-1">
                          Calculated: <strong>${((gasParams.milesPerDay / gasParams.mpg) * gasParams.gasPrice).toFixed(2)} / day</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <InputRow label="Uniforms" data={variableData.uniforms} onChange={(v) => updateVariable('uniforms', v)} />
                  <InputRow label="Consumables" data={variableData.consumables} onChange={(v) => updateVariable('consumables', v)} />
                  <InputRow label="Warranty/Callback" data={variableData.warranty} onChange={(v) => updateVariable('warranty', v)} />
                  <InputRow label="Training/Certs" data={variableData.training} onChange={(v) => updateVariable('training', v)} />
                  <InputRow label="Advertising" data={variableData.advertising} onChange={(v) => updateVariable('advertising', v)} />
                  <InputRow label="Vlog Editing" data={variableData.vlogEditing} onChange={(v) => updateVariable('vlogEditing', v)} />
                  <InputRow label="PTO Cost" data={variableData.pto} onChange={(v) => updateVariable('pto', v)} />
                  <InputRow label="Paid Holidays" data={variableData.paidHolidays} onChange={(v) => updateVariable('paidHolidays', v)} />
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-slate-700 text-sm">
                    <span>Annual Variable Total</span>
                    <span>${totalAnnualVariablePerEmp.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* FIXED OVERHEAD */}
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
                  <InputRow label="Rent" data={fixedData.rent} onChange={(v) => updateFixed('rent', v)} />
                  <InputRow label="Shop Utilities" data={fixedData.shopUtilities} onChange={(v) => updateFixed('shopUtilities', v)} />
                  <InputRow label="Software" data={fixedData.software} onChange={(v) => updateFixed('software', v)} />
                  <InputRow label="Accountant" data={fixedData.accountant} onChange={(v) => updateFixed('accountant', v)} />
                  <InputRow label="Gen. Liability Ins." data={fixedData.glInsurance} onChange={(v) => updateFixed('glInsurance', v)} />
                  <InputRow label="Licensing/Permits" data={fixedData.licensing} onChange={(v) => updateFixed('licensing', v)} />
                  <InputRow label="Bank Fees/Interest" data={fixedData.bankFees} onChange={(v) => updateFixed('bankFees', v)} />
                  <InputRow label="Office Supplies" data={fixedData.officeSupplies} onChange={(v) => updateFixed('officeSupplies', v)} />
                  <InputRow label="Janitorial/Cleaning" data={fixedData.janitorial} onChange={(v) => updateFixed('janitorial', v)} />
                  <InputRow label="Postage" data={fixedData.postage} onChange={(v) => updateFixed('postage', v)} />
                  
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
