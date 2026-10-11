import { ApplicationService } from './applicationService';
import { InterviewService } from './interviewService';
import { TaskService } from './taskService';
import { ActivityService } from './activityService';
import { AnalyticsSummary, ApplicationStatus } from '../types';

export class AnalyticsService {
  static async getSummary(userId: string): Promise<AnalyticsSummary> {
    const [appsResponse, allInterviews, allTasks, recentActivity] = await Promise.all([
      ApplicationService.list(userId, { limit: 1000 }),
      InterviewService.list(userId),
      TaskService.list(userId),
      ActivityService.list(userId, 10),
    ]);

    const apps = appsResponse.applications;
    const total_applications = apps.length;

    const in_progress = apps.filter(
      (a) => a.status === 'Applied' || a.status === 'Screening' || a.status === 'Interview'
    ).length;

    const offers_received = apps.filter((a) => a.status === 'Offer' || a.status === 'Accepted').length;
    const rejected_count = apps.filter((a) => a.status === 'Rejected').length;
    const interviews_scheduled = allInterviews.filter((i) => i.outcome === 'Scheduled').length;

    // Applications that reached Interview, Offer, or Accepted stages
    const appsReachedInterview = apps.filter(
      (a) => a.status === 'Interview' || a.status === 'Offer' || a.status === 'Accepted' || (a.interviews && a.interviews.length > 0)
    ).length;

    const interview_conversion_rate =
      total_applications > 0
        ? Math.round((appsReachedInterview / total_applications) * 100)
        : 0;

    const interview_to_offer_conversion_rate =
      appsReachedInterview > 0
        ? Math.round((offers_received / appsReachedInterview) * 100)
        : 0;

    // Status distribution
    const statusOrder: ApplicationStatus[] = [
      'Applied',
      'Screening',
      'Interview',
      'Offer',
      'Accepted',
      'Rejected',
      'Withdrawn',
    ];

    const statusCounts: Record<string, number> = {};
    for (const status of statusOrder) {
      statusCounts[status] = 0;
    }
    for (const app of apps) {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    }

    const status_distribution = statusOrder.map((status) => ({
      status,
      count: statusCounts[status] || 0,
      percentage: total_applications > 0 ? Math.round(((statusCounts[status] || 0) / total_applications) * 100) : 0,
    }));

    // Monthly breakdown (last 6-12 months)
    const monthMap = new Map<string, { count: number; interviews: number; offers: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { count: 0, interviews: 0, offers: 0 });
    }

    for (const app of apps) {
      const monthKey = app.applied_date ? app.applied_date.substring(0, 7) : app.created_at.substring(0, 7);
      if (monthMap.has(monthKey)) {
        monthMap.get(monthKey)!.count += 1;
        if (app.status === 'Offer' || app.status === 'Accepted') {
          monthMap.get(monthKey)!.offers += 1;
        }
      }
    }

    for (const int of allInterviews) {
      const monthKey = int.scheduled_at.substring(0, 7);
      if (monthMap.has(monthKey)) {
        monthMap.get(monthKey)!.interviews += 1;
      }
    }

    const monthly_applications = Array.from(monthMap.entries()).map(([month, data]) => {
      // Format as MMM YY
      const [year, m] = month.split('-');
      const date = new Date(parseInt(year, 10), parseInt(m, 10) - 1, 1);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      return {
        month: label,
        count: data.count,
        interviews: data.interviews,
        offers: data.offers,
      };
    });

    // Job Type Breakdown
    const jobTypeMap: Record<string, number> = {};
    for (const app of apps) {
      jobTypeMap[app.job_type] = (jobTypeMap[app.job_type] || 0) + 1;
    }
    const job_type_breakdown = Object.entries(jobTypeMap).map(([job_type, count]) => ({
      job_type,
      count,
    }));

    // Location Type Breakdown
    const locMap: Record<string, number> = {};
    for (const app of apps) {
      locMap[app.location_type] = (locMap[app.location_type] || 0) + 1;
    }
    const location_type_breakdown = Object.entries(locMap).map(([location_type, count]) => ({
      location_type,
      count,
    }));

    // Upcoming interviews & tasks
    const upcoming_interviews = await InterviewService.getUpcoming(userId, 5);
    const upcoming_tasks = allTasks.filter((t) => !t.is_completed).slice(0, 5);

    return {
      total_applications,
      in_progress,
      interviews_scheduled,
      offers_received,
      rejected_count,
      interview_conversion_rate,
      offer_conversion_rate: interview_to_offer_conversion_rate,
      status_distribution,
      monthly_applications,
      job_type_breakdown,
      location_type_breakdown,
      upcoming_interviews,
      upcoming_tasks,
      recent_activity: recentActivity,
    };
  }
}
