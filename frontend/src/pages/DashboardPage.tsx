import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  TrendingUp,
  Calendar,
  Award,
  XCircle,
  Clock,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
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
} from 'recharts';
import { analyticsApi, tasksApi } from '../lib/api';
import { AnalyticsSummary, Task } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, formatDateTime } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const summary = await analyticsApi.getSummary();
      setData(summary);
    } catch (err: any) {
      error('Failed to load analytics', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('application-updated', handleUpdate);
    return () => window.removeEventListener('application-updated', handleUpdate);
  }, []);

  const handleToggleTask = async (task: Task) => {
    try {
      await tasksApi.toggle(task.id);
      success('Task Updated', `"${task.title}" completion state changed`);
      fetchDashboardData();
    } catch (err: any) {
      error('Failed to update task', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="h-7 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-900 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          <div className="h-72 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
        </div>
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

  const chartData = data.status_distribution.filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Job Hunt Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline metrics, upcoming interview schedules, and active follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/kanban')}
            className="text-xs gap-1.5"
          >
            Kanban Board
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/applications')}
            className="text-xs gap-1.5"
          >
            All Applications
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Applied</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {data.total_applications}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active career opportunities</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">In Pipeline</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {data.in_progress}
          </div>
          <p className="text-[11px] text-purple-400/90 mt-1">Screening & Interview rounds</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Interviews</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {data.interviews_scheduled}
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1">Scheduled sessions</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Offers</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 tracking-tight">
            {data.offers_received}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            {data.offer_conversion_rate}% interview-to-offer
          </p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Interview Rate</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-300 tracking-tight">
            {data.interview_conversion_rate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">App-to-interview ratio</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Bar Chart */}
        <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Application & Interview Trajectory</CardTitle>
              <CardDescription>Monthly volume over the last 6 months</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>Applications</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span>Interviews</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            {data.monthly_applications.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_applications} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No monthly history yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Donut Chart */}
        <Card className="bg-slate-900/60 border-slate-800 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Pipeline Breakdown</CardTitle>
            <CardDescription>Status distribution across all roles</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            {chartData.length > 0 ? (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {chartData.map((entry) => (
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
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
                  {chartData.slice(0, 4).map((item) => (
                    <div key={item.status} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[item.status] || '#6366f1' }}
                      />
                      <span className="text-slate-300 truncate">{item.status}</span>
                      <span className="text-slate-500 font-bold ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-44 items-center justify-center text-xs text-slate-500">
                No applications added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two-Column Action Layout: Upcoming Interviews & Follow-Up Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Upcoming Interviews
              </CardTitle>
              <CardDescription>Sessions happening soon</CardDescription>
            </div>
            <Link
              to="/interviews"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {data.upcoming_interviews.length > 0 ? (
              data.upcoming_interviews.map((int) => (
                <div
                  key={int.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate">
                        {int.application?.company || 'Company'}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0">
                        {int.round_name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {formatDateTime(int.scheduled_at)}
                      </span>
                      {int.interviewer_names && (
                        <span className="truncate hidden sm:inline">
                          w/ {int.interviewer_names}
                        </span>
                      )}
                    </div>
                  </div>

                  {int.meeting_url ? (
                    <a
                      href={int.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium inline-flex items-center gap-1.5 shrink-0"
                    >
                      Join <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Badge outcome={int.outcome} />
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No upcoming interviews scheduled. Ready for your next screen!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Action Items & Tasks */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Active Tasks & Reminders
              </CardTitle>
              <CardDescription>Preparation, follow-ups, and deadlines</CardDescription>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {data.upcoming_tasks.length > 0 ? (
              data.upcoming_tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        task.is_completed
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          task.is_completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Due: {formatDate(task.due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge priority={task.priority} />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                All caught up on tasks! No pending deadlines.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline Snapshot */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle>Recent Application Activity</CardTitle>
          <CardDescription>Audit timeline of pipeline transitions and events</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recent_activity.length > 0 ? (
            <div className="divide-y divide-slate-800/80">
              {data.recent_activity.slice(0, 5).map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{act.title}</span>
                    {act.description && (
                      <p className="text-slate-400 text-[11px] mt-0.5">{act.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatDate(act.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              No activity logs recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
