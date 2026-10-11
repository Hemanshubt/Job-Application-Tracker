export type ApplicationStatus =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type LocationType = 'Remote' | 'Hybrid' | 'On-site';

export type InterviewType =
  | 'Phone Screen'
  | 'Recruiter Screen'
  | 'Technical'
  | 'System Design'
  | 'Behavioral'
  | 'Hiring Manager'
  | 'Take-home'
  | 'Final Round'
  | 'Other';

export type InterviewOutcome =
  | 'Scheduled'
  | 'Completed'
  | 'Passed'
  | 'Failed'
  | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskType =
  | 'General'
  | 'Follow-up'
  | 'Interview Prep'
  | 'Application Deadline'
  | 'Thank You Note'
  | 'Offer Review';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  headline?: string;
  target_role?: string;
  location?: string;
  bio?: string;
  resume_url?: string;
  resume_filename?: string;
  preferences?: {
    currency?: string;
    default_view?: 'table' | 'cards' | 'kanban';
    notifications_enabled?: boolean;
    email_reminders?: boolean;
    compact_cards?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  job_title: string;
  location?: string;
  location_type: LocationType;
  job_type: JobType;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  job_url?: string;
  status: ApplicationStatus;
  applied_date: string;
  deadline?: string | null;
  description?: string;
  notes?: string;
  rating?: number;
  resume_url?: string;
  resume_filename?: string;
  created_at: string;
  updated_at: string;
  interviews?: Interview[];
  tasks?: Task[];
  recruiters?: Recruiter[];
  notes_list?: ApplicationNote[];
}

export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  round_name: string;
  interview_type: InterviewType;
  scheduled_at: string;
  duration_minutes: number;
  interviewer_names?: string;
  interviewer_emails?: string;
  meeting_url?: string;
  prep_notes?: string;
  feedback?: string;
  outcome: InterviewOutcome;
  created_at: string;
  updated_at: string;
  application?: {
    company: string;
    job_title: string;
  };
}

export interface Recruiter {
  id: string;
  user_id: string;
  application_id?: string | null;
  name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  last_contact_date?: string | null;
  next_followup_date?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  application?: {
    company: string;
    job_title: string;
  };
}

export interface Task {
  id: string;
  user_id: string;
  application_id?: string | null;
  title: string;
  description?: string;
  task_type: TaskType;
  priority: TaskPriority;
  due_date?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  reminder_at?: string | null;
  created_at: string;
  updated_at: string;
  application?: {
    company: string;
    job_title: string;
  };
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  application_id?: string | null;
  action_type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  application?: {
    company: string;
    job_title: string;
  };
}

export interface AnalyticsSummary {
  total_applications: number;
  in_progress: number;
  interviews_scheduled: number;
  offers_received: number;
  rejected_count: number;
  interview_conversion_rate: number;
  offer_conversion_rate: number;
  status_distribution: { status: string; count: number; percentage: number }[];
  monthly_applications: { month: string; count: number; interviews: number; offers: number }[];
  job_type_breakdown: { job_type: string; count: number }[];
  location_type_breakdown: { location_type: string; count: number }[];
  upcoming_interviews: Interview[];
  upcoming_tasks: Task[];
  recent_activity: ActivityLog[];
}
