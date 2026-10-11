import { z } from 'zod';

export const ApplicationStatusEnum = z.enum([
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected',
  'Withdrawn',
]);

export const LocationTypeEnum = z.enum(['Remote', 'Hybrid', 'On-site']);
export const JobTypeEnum = z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']);

export const InterviewTypeEnum = z.enum([
  'Phone Screen',
  'Recruiter Screen',
  'Technical',
  'System Design',
  'Behavioral',
  'Hiring Manager',
  'Take-home',
  'Final Round',
  'Other',
]);

export const InterviewOutcomeEnum = z.enum([
  'Scheduled',
  'Completed',
  'Passed',
  'Failed',
  'Cancelled',
]);

export const TaskPriorityEnum = z.enum(['Low', 'Medium', 'High', 'Urgent']);
export const TaskTypeEnum = z.enum([
  'General',
  'Follow-up',
  'Interview Prep',
  'Application Deadline',
  'Thank You Note',
  'Offer Review',
]);

export const ApplicationCreateSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  job_title: z.string().min(1, 'Job title is required').max(100),
  location: z.string().max(100).optional().nullable(),
  location_type: LocationTypeEnum.default('Remote'),
  job_type: JobTypeEnum.default('Full-time'),
  salary_min: z.number().nonnegative().optional().nullable(),
  salary_max: z.number().nonnegative().optional().nullable(),
  salary_currency: z.string().max(10).default('INR'),
  job_url: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
  status: ApplicationStatusEnum.default('Applied'),
  applied_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').default(() => new Date().toISOString().split('T')[0]),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  rating: z.number().int().min(1).max(5).default(3),
  resume_url: z.string().url().or(z.literal('')).optional().nullable(),
  resume_filename: z.string().max(255).optional().nullable(),
});

export const ApplicationUpdateSchema = ApplicationCreateSchema.partial();

export const InterviewCreateSchema = z.object({
  application_id: z.string().uuid('Valid Application ID is required'),
  round_name: z.string().min(1, 'Round name is required').max(100),
  interview_type: InterviewTypeEnum.default('Technical'),
  scheduled_at: z.string().datetime({ message: 'Valid ISO timestamp is required' }),
  duration_minutes: z.number().int().positive().default(45),
  interviewer_names: z.string().max(200).optional().nullable(),
  interviewer_emails: z.string().max(200).optional().nullable(),
  meeting_url: z.string().url('Invalid URL').or(z.literal('')).optional().nullable(),
  prep_notes: z.string().max(5000).optional().nullable(),
  feedback: z.string().max(5000).optional().nullable(),
  outcome: InterviewOutcomeEnum.default('Scheduled'),
});

export const InterviewUpdateSchema = InterviewCreateSchema.partial();

export const RecruiterCreateSchema = z.object({
  application_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Recruiter name is required').max(100),
  company: z.string().max(100).optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional().nullable(),
  last_contact_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  next_followup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
});

export const RecruiterUpdateSchema = RecruiterCreateSchema.partial();

export const TaskCreateSchema = z.object({
  application_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  task_type: TaskTypeEnum.default('General'),
  priority: TaskPriorityEnum.default('Medium'),
  due_date: z.string().datetime().optional().nullable(),
  is_completed: z.boolean().default(false),
  reminder_at: z.string().datetime().optional().nullable(),
});

export const TaskUpdateSchema = TaskCreateSchema.partial();

export const NoteCreateSchema = z.object({
  application_id: z.string().uuid('Valid Application ID is required'),
  content: z.string().min(1, 'Note content cannot be empty').max(5000),
});

export const ProfileUpdateSchema = z.object({
  full_name: z.string().max(100).optional(),
  avatar_url: z.string().url().or(z.literal('')).optional().nullable(),
  headline: z.string().max(150).optional().nullable(),
  target_role: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  resume_url: z.string().url().or(z.literal('')).optional().nullable(),
  resume_filename: z.string().max(255).optional().nullable(),
  preferences: z.record(z.any()).optional(),
});
