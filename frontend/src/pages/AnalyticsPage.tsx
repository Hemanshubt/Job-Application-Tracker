import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Briefcase,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  Percent,
  Calculator,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '../lib/api';
import { AnalyticsSummary } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { OfferComparisonModal } from '../components/analytics/OfferComparisonModal';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await analyticsApi.getSummary();
        setData(res);
      } catch (err: any) {
        error('Failed to load analytics', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-72 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const STATUS_COLORS: Record<string, string> = {
    Applied: '#3b82f6',
    Screening: '#8b5cf6',
    Interview: '#f59e0b',
    Offer: '#10b981',
    Accepted: '#14b8a6',
    Rejected: '#f43f5e',
    Withdrawn: '#71717a',
  };

  const statusData = data.status_distribution.filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Job Search Analytics & Conversion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep performance funnel analysis calculated from real applications and interviews.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsOfferModalOpen(true)}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
        >
          <Calculator className="w-4 h-4" /> Compare Offers & CTC
        </Button>
      </div>

      {/* Conversion Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Applications</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {data.total_applications}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total submitted to date</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interview Conversion</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-400 tracking-tight">
            {data.interview_conversion_rate}%
          </div>
          <p className="text-[11px] text-indigo-300/80 mt-1">
            Applications that secured a screen
          </p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interview to Offer</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 tracking-tight">
            {data.offer_conversion_rate}%
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            Interviews converted to offers
          </p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Offers vs Rejections</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {data.offers_received} <span className="text-sm font-normal text-slate-500">vs</span> {data.rejected_count}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {data.rejected_count > 0
              ? `${Math.round((data.offers_received / (data.offers_received + data.rejected_count)) * 100)}% positive ratio`
              : 'Zero rejections logged'}
          </p>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Submission & Outcome Trajectory */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>Application Volume Over Time</CardTitle>
            <CardDescription>Monthly submissions, interviews, and offers</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {data.monthly_applications.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_applications} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="interviews" name="Interviews" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="offers" name="Offers" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No monthly data recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Current stage representation</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2 flex flex-col justify-between">
            {statusData.length > 0 ? (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={`cell-${entry.status}`}
                            fill={STATUS_COLORS[entry.status] || '#6366f1'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  {statusData.map((item) => (
                    <div key={item.status} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.status] || '#6366f1' }}
                      />
                      <span className="text-slate-300">{item.status}:</span>
                      <span className="font-bold text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No applications added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns: Job Type & Location Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>Workplace Mode Distribution</CardTitle>
            <CardDescription>Remote vs Hybrid vs On-site roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.location_type_breakdown.map((item) => {
                const pct =
                  data.total_applications > 0
                    ? Math.round((item.count / data.total_applications) * 100)
                    : 0;

                return (
                  <div key={item.location_type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{item.location_type}</span>
                      <span>{item.count} roles ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle>Employment Type Breakdown</CardTitle>
            <CardDescription>Full-time, Contract, Part-time, Internship</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.job_type_breakdown.map((item) => {
                const pct =
                  data.total_applications > 0
                    ? Math.round((item.count / data.total_applications) * 100)
                    : 0;

                return (
                  <div key={item.job_type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{item.job_type}</span>
                      <span>{item.count} roles ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offer Comparison & CTC Calculator Modal */}
      <OfferComparisonModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />
    </div>
  );
};
