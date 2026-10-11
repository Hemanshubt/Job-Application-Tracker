import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { applicationsApi } from '../../lib/api';
import { Application } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Calculator,
  Award,
  TrendingUp,
  Plus,
  Trash2,
  Copy,
  Check,
  Building2,
  Briefcase,
  DollarSign,
  Gift,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export interface OfferData {
  id: string;
  company: string;
  role: string;
  currency: 'INR' | 'USD';
  baseSalary: number; // in Rupees or USD
  joiningBonus: number;
  performanceBonus: number; // Annual
  stocksPerYear: number;
  benefitsAnnual: number;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  notes: string;
}

interface OfferComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfferComparisonModal: React.FC<OfferComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Initial Offers
  const [offers, setOffers] = useState<OfferData[]>([
    {
      id: 'offer-1',
      company: 'Razorpay',
      role: 'Senior Software Engineer',
      currency: 'INR',
      baseSalary: 2800000,
      joiningBonus: 300000,
      performanceBonus: 350000,
      stocksPerYear: 600000,
      benefitsAnnual: 120000,
      workMode: 'Hybrid',
      notes: 'Bengaluru HQ, includes health insurance for parents & learning stipend.',
    },
    {
      id: 'offer-2',
      company: 'Atlassian',
      role: 'Software Engineer II',
      currency: 'INR',
      baseSalary: 3200000,
      joiningBonus: 400000,
      performanceBonus: 400000,
      stocksPerYear: 1000000,
      benefitsAnnual: 200000,
      workMode: 'Remote',
      notes: 'TEAM Anywhere program, generous wellness stipend & home office setup.',
    },
  ]);

  // Load existing user applications to offer quick auto-fill
  const [candidateApps, setCandidateApps] = useState<Application[]>([]);

  useEffect(() => {
    if (isOpen) {
      applicationsApi
        .list({ limit: 100 })
        .then((res) => {
          const matching = res.applications.filter(
            (a) => a.status === 'Offer' || a.status === 'Accepted' || (a.salary_min && a.salary_min > 0)
          );
          setCandidateApps(matching);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleAddOfferFromApp = (app: Application) => {
    if (offers.length >= 4) return;
    const isUsd = app.salary_currency === 'USD';
    const base = app.salary_max || app.salary_min || (isUsd ? 120000 : 2500000);

    const newOffer: OfferData = {
      id: `offer-${Date.now()}`,
      company: app.company,
      role: app.job_title,
      currency: isUsd ? 'USD' : 'INR',
      baseSalary: base,
      joiningBonus: isUsd ? 10000 : 200000,
      performanceBonus: Math.round(base * 0.1),
      stocksPerYear: isUsd ? 25000 : 400000,
      benefitsAnnual: isUsd ? 5000 : 100000,
      workMode: app.location_type || 'Hybrid',
      notes: `Imported from ${app.company} application.`,
    };

    setOffers([...offers, newOffer]);
    success('Offer Added', `Imported ${app.company} offer to comparison`);
  };

  const handleAddNewBlankOffer = () => {
    if (offers.length >= 4) return;
    const isUsd = currency === 'USD';
    const newOffer: OfferData = {
      id: `offer-${Date.now()}`,
      company: `Offer ${offers.length + 1}`,
      role: 'Software Engineer',
      currency: isUsd ? 'USD' : 'INR',
      baseSalary: isUsd ? 110000 : 2400000,
      joiningBonus: isUsd ? 10000 : 200000,
      performanceBonus: isUsd ? 15000 : 250000,
      stocksPerYear: isUsd ? 20000 : 350000,
      benefitsAnnual: isUsd ? 6000 : 100000,
      workMode: 'Hybrid',
      notes: '',
    };
    setOffers([...offers, newOffer]);
  };

  const handleRemoveOffer = (id: string) => {
    if (offers.length <= 1) return;
    setOffers(offers.filter((o) => o.id !== id));
  };

  const updateOffer = (id: string, updates: Partial<OfferData>) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, updates, ...updates } : o)));
  };

  // Helper formatters
  const formatMoney = (amount: number, curr: 'INR' | 'USD') => {
    if (curr === 'INR') {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} LPA`;
      }
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Calculations
  const calculateYear1Total = (o: OfferData) => {
    return o.baseSalary + o.joiningBonus + o.performanceBonus + o.stocksPerYear + o.benefitsAnnual;
  };

  const calculateGuaranteedCash = (o: OfferData) => {
    return o.baseSalary + o.joiningBonus;
  };

  // Monthly in-hand take home estimation
  const estimateMonthlyTakeHome = (o: OfferData) => {
    if (o.currency === 'INR') {
      // In India: Standard deduction ₹75,000 + progressive tax under new regime estimate
      // Effective tax approx 15% - 25% depending on bracket
      const grossAnnual = o.baseSalary + o.performanceBonus;
      const taxable = Math.max(0, grossAnnual - 75000);
      let tax = 0;
      if (taxable > 1500000) {
        tax = 150000 + (taxable - 1500000) * 0.3;
      } else if (taxable > 1200000) {
        tax = 90000 + (taxable - 1200000) * 0.2;
      } else if (taxable > 900000) {
        tax = 45000 + (taxable - 900000) * 0.15;
      } else if (taxable > 600000) {
        tax = 15000 + (taxable - 600000) * 0.1;
      }
      // EPF deduction approx 12% of basic (capped or 21600/yr standard)
      const epf = 21600;
      const netAnnual = grossAnnual - tax - epf;
      return Math.round(netAnnual / 12);
    } else {
      // USD flat 24% effective federal + state estimate
      const grossAnnual = o.baseSalary + o.performanceBonus;
      const netAnnual = grossAnnual * 0.74;
      return Math.round(netAnnual / 12);
    }
  };

  // Find winners
  const year1Totals = offers.map((o) => calculateYear1Total(o));
  const maxYear1 = Math.max(...year1Totals);

  const guaranteedCashes = offers.map((o) => calculateGuaranteedCash(o));
  const maxGuaranteed = Math.max(...guaranteedCashes);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const lines = [
      `=== Job Offer Comparison Summary ===`,
      ...offers.map((o) => {
        const y1 = calculateYear1Total(o);
        const cash = calculateGuaranteedCash(o);
        const monthly = estimateMonthlyTakeHome(o);
        return `\n${o.company} (${o.role} - ${o.workMode}):
• First Year Total CTC: ${formatMoney(y1, o.currency)}
• Guaranteed Cash: ${formatMoney(cash, o.currency)} (Base: ${formatMoney(o.baseSalary, o.currency)} + Joining: ${formatMoney(o.joiningBonus, o.currency)})
• Annual Stock/ESOPs: ${formatMoney(o.stocksPerYear, o.currency)}
• Estimated Monthly In-Hand: ${formatMoney(monthly, o.currency)}/month
• Benefits Value: ${formatMoney(o.benefitsAnnual, o.currency)}
${o.notes ? `• Notes: ${o.notes}` : ''}`;
      }),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    success('Copied', 'Offer comparison summary copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Offer Comparison & CTC Calculator"
      description="Compare total compensation packages side-by-side with 1st-year CTC, guaranteed cash, equity upside, and net in-hand pay."
      maxWidth="5xl"
    >
      <div className="space-y-6 pt-2">
        {/* Top Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Default Currency:</span>
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currency === 'INR'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR (LPA)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD ($)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {candidateApps.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 hidden sm:inline">Import App:</span>
                <select
                  aria-label="Import offer from existing job application"
                  onChange={(e) => {
                    const selected = candidateApps.find((a) => a.id === e.target.value);
                    if (selected) {
                      handleAddOfferFromApp(selected);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>
                    + Import from Applications...
                  </option>
                  {candidateApps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company} ({a.job_title})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {offers.length < 4 && (
              <Button size="sm" variant="outline" onClick={handleAddNewBlankOffer} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Offer Column
              </Button>
            )}

            <Button size="sm" variant="secondary" onClick={handleCopySummary} className="gap-1.5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </Button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto pb-4">
          <div className={`grid gap-4 min-w-[680px] ${
            offers.length === 1
              ? 'grid-cols-1'
              : offers.length === 2
              ? 'grid-cols-2'
              : offers.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-4'
          }`}>
            {offers.map((offer, idx) => {
              const y1Total = calculateYear1Total(offer);
              const guaranteed = calculateGuaranteedCash(offer);
              const monthlyNet = estimateMonthlyTakeHome(offer);
              const isHighestY1 = y1Total === maxYear1 && offers.length > 1;
              const isHighestGuaranteed = guaranteed === maxGuaranteed && offers.length > 1;

              return (
                <div
                  key={offer.id}
                  className={`rounded-2xl border p-4.5 bg-slate-900/90 flex flex-col relative transition-all ${
                    isHighestY1
                      ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Badge for Winner */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Option {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isHighestY1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Top CTC
                        </span>
                      )}
                      {offers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOffer(offer.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                          title="Remove offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Company & Role inputs */}
                  <div className="space-y-2 pb-4 border-b border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium">Company Name</label>
                      <input
                        type="text"
                        value={offer.company}
                        onChange={(e) => updateOffer(offer.id, { company: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Company"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium">Job Title / Level</label>
                      <input
                        type="text"
                        value={offer.role}
                        onChange={(e) => updateOffer(offer.id, { role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        placeholder="Role Title"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <select
                        aria-label="Work Mode"
                        value={offer.workMode}
                        onChange={(e) => updateOffer(offer.id, { workMode: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 flex-1 focus:outline-none"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                      <select
                        aria-label="Currency"
                        value={offer.currency}
                        onChange={(e) => updateOffer(offer.id, { currency: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none font-bold"
                      >
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Metric Highlights */}
                  <div className="my-4 bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">Year 1 Total CTC</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        {formatMoney(y1Total, offer.currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1">
                        Guaranteed Cash
                        {isHighestGuaranteed && (
                          <span className="text-[9px] text-blue-400 font-bold">★ Highest</span>
                        )}
                      </span>
                      <span className="font-semibold text-white">
                        {formatMoney(guaranteed, offer.currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Est. Monthly In-Hand</span>
                      <span className="font-bold text-indigo-300">
                        ~{formatMoney(monthlyNet, offer.currency)}
                        <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Breakdown Input Fields */}
                  <div className="space-y-2.5 text-xs flex-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Base Annual Salary</span>
                        <span className="text-slate-300 font-mono">{formatMoney(offer.baseSalary, offer.currency)}</span>
                      </div>
                      <input
                        type="number"
                        step={offer.currency === 'INR' ? '50000' : '1000'}
                        value={offer.baseSalary}
                        onChange={(e) => updateOffer(offer.id, { baseSalary: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Joining / Sign-on Bonus</span>
                        <span className="text-slate-300 font-mono">{formatMoney(offer.joiningBonus, offer.currency)}</span>
                      </div>
                      <input
                        type="number"
                        step={offer.currency === 'INR' ? '25000' : '1000'}
                        value={offer.joiningBonus}
                        onChange={(e) => updateOffer(offer.id, { joiningBonus: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Annual Perf Bonus (Target)</span>
                        <span className="text-slate-300 font-mono">{formatMoney(offer.performanceBonus, offer.currency)}</span>
                      </div>
                      <input
                        type="number"
                        step={offer.currency === 'INR' ? '25000' : '1000'}
                        value={offer.performanceBonus}
                        onChange={(e) => updateOffer(offer.id, { performanceBonus: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Stocks / ESOPs (Per Year)</span>
                        <span className="text-slate-300 font-mono">{formatMoney(offer.stocksPerYear, offer.currency)}</span>
                      </div>
                      <input
                        type="number"
                        step={offer.currency === 'INR' ? '50000' : '1000'}
                        value={offer.stocksPerYear}
                        onChange={(e) => updateOffer(offer.id, { stocksPerYear: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Benefits & Health (Annual)</span>
                        <span className="text-slate-300 font-mono">{formatMoney(offer.benefitsAnnual, offer.currency)}</span>
                      </div>
                      <input
                        type="number"
                        step={offer.currency === 'INR' ? '10000' : '500'}
                        value={offer.benefitsAnnual}
                        onChange={(e) => updateOffer(offer.id, { benefitsAnnual: Number(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="text-[10px] text-slate-400 font-medium">Perks & Negotiation Notes</label>
                      <textarea
                        rows={2}
                        value={offer.notes}
                        onChange={(e) => updateOffer(offer.id, { notes: e.target.value })}
                        placeholder="e.g. 4-day workweek, 100% health insurance..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pro Tip Section */}
        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Negotiation Strategy Tip</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When evaluating offers, calculate both guaranteed cash and total potential upside. If an employer cannot match a higher base salary, leverage competing offers to ask for an increased <strong>sign-on bonus</strong> or <strong>accelerated stock vesting</strong>.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
