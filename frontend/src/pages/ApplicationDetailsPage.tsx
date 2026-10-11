import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  UserCheck,
  FileText,
  History,
  Star,
  Mail,
  Sparkles,
} from 'lucide-react';
import { EmailTemplateModal } from '../components/outreach/EmailTemplateModal';
import { AtsMatchModal } from '../components/ats/AtsMatchModal';
import {
  applicationsApi,
  interviewsApi,
  tasksApi,
  recruitersApi,
  notesApi,
  activityApi,
} from '../lib/api';
import {
  Application,
  Interview,
  Task,
  Recruiter,
  ApplicationNote,
  ActivityLog,
  ApplicationStatus,
} from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ResumeUpload } from '../components/ui/ResumeUpload';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { formatSalaryRange, formatDate, formatDateTime } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { profile } = useAuth();

  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: 'overview' | 'interviews' | 'tasks' | 'contacts' | 'notes' | 'activity'
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'tasks' | 'contacts' | 'notes' | 'activity'>('overview');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Interview modal form
  const [interviewForm, setInterviewForm] = useState<Partial<Interview>>({
    round_name: '',
    interview_type: 'Technical',
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duration_minutes: 45,
    interviewer_names: '',
    meeting_url: '',
    prep_notes: '',
    outcome: 'Scheduled',
  });

  // Task modal form
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    task_type: 'Interview Prep',
    priority: 'Medium',
    due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  // Recruiter modal form
  const [recruiterForm, setRecruiterForm] = useState<Partial<Recruiter>>({
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    linkedin_url: '',
    notes: '',
  });

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const appData = await applicationsApi.getById(id);
      setApplication(appData);

      const [ints, ts, recs, ns, acts] = await Promise.all([
        interviewsApi.list(id),
        tasksApi.list({ applicationId: id }),
        recruitersApi.list(id),
        notesApi.list(id),
        activityApi.list(20, id),
      ]);

      setInterviews(ints);
      setTasks(ts);
      setRecruiters(recs);
      setNotes(ns);
      setActivities(acts);
    } catch (err: any) {
      error('Could not load application', err.message);
      navigate('/applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!id) return;
    try {
      await applicationsApi.updateStatus(id, status);
      success('Status Changed', `Application moved to ${status}`);
      loadData();
    } catch (err: any) {
      error('Failed to change status', err.message);
    }
  };

  const handleUpdateApplication = async (data: Partial<Application>) => {
    if (!id) return;
    try {
      await applicationsApi.update(id, data);
      success('Saved', 'Application details updated.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to update', err.message);
    }
  };

  const handleDeleteApplication = async () => {
    if (!id) return;
    try {
      await applicationsApi.delete(id);
      success('Deleted', 'Application removed.');
      navigate('/applications');
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !interviewForm.round_name) return;
    try {
      await interviewsApi.create({
        ...interviewForm,
        application_id: id,
        scheduled_at: new Date(interviewForm.scheduled_at!).toISOString(),
      });
      success('Interview Scheduled', `${interviewForm.round_name} recorded.`);
      setIsInterviewModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to schedule interview', err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskForm.title) return;
    try {
      await tasksApi.create({
        ...taskForm,
        application_id: id,
        due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
      });
      success('Task Created', `Added action item "${taskForm.title}".`);
      setIsTaskModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to create task', err.message);
    }
  };

  const handleCreateRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !recruiterForm.name) return;
    try {
      await recruitersApi.create({
        ...recruiterForm,
        application_id: id,
        company: recruiterForm.company || application?.company,
      });
      success('Contact Saved', `Saved contact for ${recruiterForm.name}.`);
      setIsRecruiterModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save contact', err.message);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNoteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      await notesApi.create(id, newNoteContent.trim());
      success('Note Added', 'Timestamped note saved.');
      setNewNoteContent('');
      loadData();
    } catch (err: any) {
      error('Failed to add note', err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await tasksApi.toggle(taskId);
      loadData();
    } catch (err: any) {
      error('Failed to update task', err.message);
    }
  };

  if (isLoading || !application) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
        <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to applications
      </Link>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-2xl shrink-0">
              {application.company.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {application.company}
                </h1>
                {application.job_url && (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-400 p-1"
                    title="Open Job Posting"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-300 font-medium mt-0.5">
                {application.job_title}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {application.location || 'Remote'} ({application.location_type})
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  {formatSalaryRange(application.salary_min, application.salary_max, application.salary_currency)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Applied: {formatDate(application.applied_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons & Status selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Stage:</span>
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className="bg-transparent text-xs font-bold text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value="Applied" className="bg-slate-900 text-blue-400">Applied</option>
                <option value="Screening" className="bg-slate-900 text-purple-400">Screening</option>
                <option value="Interview" className="bg-slate-900 text-amber-400">Interview</option>
                <option value="Offer" className="bg-slate-900 text-emerald-400">Offer</option>
                <option value="Accepted" className="bg-slate-900 text-teal-400">Accepted</option>
                <option value="Rejected" className="bg-slate-900 text-rose-400">Rejected</option>
                <option value="Withdrawn" className="bg-slate-900 text-zinc-400">Withdrawn</option>
              </select>
            </div>

            {application.resume_url && (
              <a
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-medium text-indigo-300 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Resume</span>
                <ExternalLink className="w-3 h-3 text-indigo-400/70" />
              </a>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmailModalOpen(true)}
              className="gap-1.5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
              title="Generate cold emails, referral requests, or thank-you notes"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Outreach</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAtsModalOpen(true)}
              className="gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              title="Analyze Job Description & ATS Keyword Match"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ATS Match</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { key: 'overview', label: 'Overview & Notes', count: undefined },
          { key: 'interviews', label: 'Interviews', count: interviews.length },
          { key: 'tasks', label: 'Tasks', count: tasks.filter((t) => !t.is_completed).length },
          { key: 'contacts', label: 'Recruiters', count: recruiters.length },
          { key: 'notes', label: 'Note History', count: notes.length },
          { key: 'activity', label: 'Timeline', count: activities.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="rounded-full bg-slate-700/80 px-1.5 py-0.2 text-[10px] text-slate-300">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Job Description & Scope</h3>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {application.description || 'No description entered yet. Edit to add scope.'}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-2">Personal Strategy Notes</h3>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {application.notes || 'No strategy notes recorded.'}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-white">Application Metadata</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Employment Type</span>
                <span className="font-medium text-slate-200">{application.job_type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Workplace Mode</span>
                <span className="font-medium text-slate-200">{application.location_type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Expected Deadline</span>
                <span className="font-medium text-slate-200">{formatDate(application.deadline)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Excitement Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        (application.rating || 3) >= s
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-500">Tracked Since</span>
                <span className="font-medium text-slate-200">{formatDate(application.created_at)}</span>
              </div>
            </div>

            {/* Tailored / Master Resume Section */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Opportunity Resume</span>

                {profile?.resume_url && (
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await applicationsApi.update(application.id, {
                            resume_url: profile.resume_url,
                            resume_filename: profile.resume_filename || 'Master_Resume.pdf',
                          });
                          setApplication((prev) => prev ? {
                            ...prev,
                            resume_url: profile.resume_url,
                            resume_filename: profile.resume_filename || 'Master_Resume.pdf',
                          } : null);
                          success('Master CV Attached', 'Using default resume from profile.');
                        } catch (err: any) {
                          error('Update Failed', err?.message);
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                        application.resume_url === profile.resume_url
                          ? 'bg-indigo-600 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Use Master</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (application.resume_url === profile.resume_url) {
                          try {
                            await applicationsApi.update(application.id, {
                              resume_url: '' as any,
                              resume_filename: '' as any,
                            });
                            setApplication((prev) => prev ? { ...prev, resume_url: undefined, resume_filename: undefined } : null);
                          } catch (err: any) {
                            console.error(err);
                          }
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                        application.resume_url !== profile.resume_url
                          ? 'bg-indigo-600 text-white font-medium shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Upload New</span>
                    </button>
                  </div>
                )}
              </div>

              {application.resume_url && application.resume_url === profile?.resume_url ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-300">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {application.resume_filename || 'Master_Resume.pdf'}
                      </p>
                      <span className="text-[10px] text-indigo-300">Master CV Linked</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await applicationsApi.update(application.id, {
                            resume_url: '' as any,
                            resume_filename: '' as any,
                          });
                          setApplication((prev) => prev ? { ...prev, resume_url: undefined, resume_filename: undefined } : null);
                          success('Detached', 'Detached master resume.');
                        } catch (err: any) {
                          error('Failed', err?.message);
                        }
                      }}
                      className="text-xs px-2 py-1 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                    >
                      Detach
                    </button>
                  </div>
                </div>
              ) : (
                <ResumeUpload
                  label=""
                  description="Upload the customized resume version used for this company (PDF, DOCX up to 10MB)"
                  resumeUrl={application.resume_url}
                  resumeFilename={application.resume_filename}
                  onUploadComplete={async (url, filename) => {
                    try {
                      await applicationsApi.update(application.id, {
                        resume_url: url,
                        resume_filename: filename,
                      });
                      setApplication((prev) => prev ? { ...prev, resume_url: url, resume_filename: filename } : null);
                      success('Resume Updated', 'Application resume saved.');
                    } catch (err: any) {
                      error('Update Failed', err?.message);
                    }
                  }}
                  onRemove={async () => {
                    try {
                      await applicationsApi.update(application.id, {
                        resume_url: '' as any,
                        resume_filename: '' as any,
                      });
                      setApplication((prev) => prev ? { ...prev, resume_url: undefined, resume_filename: undefined } : null);
                      success('Resume Removed', 'Detached resume from application.');
                    } catch (err: any) {
                      error('Remove Failed', err?.message);
                    }
                  }}
                />
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 2. INTERVIEWS */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Scheduled & Past Rounds</h3>
            <Button size="sm" onClick={() => setIsInterviewModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Schedule Interview
            </Button>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
              No interview rounds logged yet for this application.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map((int) => (
                <Card key={int.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{int.round_name}</h4>
                      <p className="text-[11px] text-slate-400">{int.interview_type} • {int.duration_minutes} min</p>
                    </div>
                    <Badge outcome={int.outcome} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {formatDateTime(int.scheduled_at)}
                    </div>
                    {int.interviewer_names && (
                      <p className="text-slate-400">Interviewers: {int.interviewer_names}</p>
                    )}
                    {int.prep_notes && (
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-slate-200 block mb-0.5">Prep Notes:</span>
                        {int.prep_notes}
                      </div>
                    )}
                  </div>

                  {int.meeting_url && (
                    <div className="pt-2">
                      <a
                        href={int.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Join Video Call <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Action Items & Reminders</h3>
            <Button size="sm" onClick={() => setIsTaskModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
              No tasks linked to this application.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                        task.is_completed
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          task.is_completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.due_date && (
                      <span className="text-[11px] text-slate-400">
                        Due: {formatDate(task.due_date)}
                      </span>
                    )}
                    <Badge priority={task.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recruiters & Internal Contacts</h3>
            <Button size="sm" onClick={() => setIsRecruiterModalOpen(true)} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Contact
            </Button>
          </div>

          {recruiters.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
              No contacts saved yet for this company.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recruiters.map((rec) => (
                <Card key={rec.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{rec.name}</h4>
                      <p className="text-[11px] text-slate-400">{rec.title || 'Recruiter'}</p>
                    </div>
                    {rec.linkedin_url && (
                      <a
                        href={rec.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                        title="LinkedIn Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {rec.email && <p>Email: <a href={`mailto:${rec.email}`} className="text-indigo-400">{rec.email}</a></p>}
                    {rec.phone && <p>Phone: {rec.phone}</p>}
                    {rec.notes && <p className="text-slate-400 text-[11px] pt-1">Notes: {rec.notes}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={handleAddNote} className="space-y-2">
            <Textarea
              placeholder="Record fresh interview feedback, negotiation notes, or question logs..."
              rows={3}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" isLoading={isSubmittingNote} disabled={!newNoteContent.trim()}>
                Add Timestamped Note
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {notes.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Note</span>
                  <span>{formatDateTime(n.created_at)}</span>
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <Card>
          <div className="divide-y divide-slate-800/80">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No activity logged yet.</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between text-xs">
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
              ))
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateApplication}
        initialData={application}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message={`Delete your application for ${application.company}? This cannot be undone.`}
      />

      {/* Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Interview Round"
      >
        <form onSubmit={handleCreateInterview} className="space-y-4">
          <Input
            label="Round Name *"
            placeholder="e.g. Technical Screen, System Design, Final"
            value={interviewForm.round_name || ''}
            onChange={(e) => setInterviewForm((prev) => ({ ...prev, round_name: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Interview Type"
              value={interviewForm.interview_type || 'Technical'}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, interview_type: e.target.value as any }))}
              options={[
                { value: 'Phone Screen', label: 'Phone Screen' },
                { value: 'Recruiter Screen', label: 'Recruiter Screen' },
                { value: 'Technical', label: 'Technical' },
                { value: 'System Design', label: 'System Design' },
                { value: 'Behavioral', label: 'Behavioral' },
                { value: 'Hiring Manager', label: 'Hiring Manager' },
                { value: 'Take-home', label: 'Take-home' },
                { value: 'Final Round', label: 'Final Round' },
              ]}
            />
            <Input
              label="Date & Time *"
              type="datetime-local"
              value={interviewForm.scheduled_at || ''}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, scheduled_at: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Meeting Video URL"
            placeholder="https://meet.google.com/xyz or Zoom URL"
            value={interviewForm.meeting_url || ''}
            onChange={(e) => setInterviewForm((prev) => ({ ...prev, meeting_url: e.target.value }))}
          />
          <Input
            label="Interviewers"
            placeholder="Marcus Vance, Elena Rostova"
            value={interviewForm.interviewer_names || ''}
            onChange={(e) => setInterviewForm((prev) => ({ ...prev, interviewer_names: e.target.value }))}
          />
          <Textarea
            label="Prep Notes / Key Topics"
            placeholder="Focus on distributed systems, SQL indexing, concurrency..."
            value={interviewForm.prep_notes || ''}
            onChange={(e) => setInterviewForm((prev) => ({ ...prev, prep_notes: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsInterviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Round</Button>
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Action Item"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Solve LeetCode Top 50, Send Thank You note"
            value={taskForm.title || ''}
            onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Task Type"
              value={taskForm.task_type || 'Interview Prep'}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, task_type: e.target.value as any }))}
              options={[
                { value: 'Interview Prep', label: 'Interview Prep' },
                { value: 'Follow-up', label: 'Follow-up' },
                { value: 'Application Deadline', label: 'Application Deadline' },
                { value: 'Thank You Note', label: 'Thank You Note' },
                { value: 'Offer Review', label: 'Offer Review' },
              ]}
            />
            <Select
              label="Priority"
              value={taskForm.priority || 'Medium'}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, priority: e.target.value as any }))}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Urgent', label: 'Urgent' },
              ]}
            />
          </div>
          <Input
            label="Due Date"
            type="datetime-local"
            value={taskForm.due_date || ''}
            onChange={(e) => setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Recruiter Modal */}
      <Modal
        isOpen={isRecruiterModalOpen}
        onClose={() => setIsRecruiterModalOpen(false)}
        title="Save Recruiter Contact"
      >
        <form onSubmit={handleCreateRecruiter} className="space-y-4">
          <Input
            label="Contact Name *"
            placeholder="e.g. Sarah Jenkins"
            value={recruiterForm.name || ''}
            onChange={(e) => setRecruiterForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Job Title"
            placeholder="e.g. Senior Talent Partner"
            value={recruiterForm.title || ''}
            onChange={(e) => setRecruiterForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              placeholder="sjenkins@company.com"
              value={recruiterForm.email || ''}
              onChange={(e) => setRecruiterForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Phone"
              placeholder="+91 98765 43210"
              value={recruiterForm.phone || ''}
              onChange={(e) => setRecruiterForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/username"
            value={recruiterForm.linkedin_url || ''}
            onChange={(e) => setRecruiterForm((prev) => ({ ...prev, linkedin_url: e.target.value }))}
          />
          <Textarea
            label="Notes"
            placeholder="Preferred contact hours, scheduling links..."
            value={recruiterForm.notes || ''}
            onChange={(e) => setRecruiterForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsRecruiterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Contact</Button>
          </div>
        </form>
      </Modal>

      {/* Outreach Email Templates Modal */}
      <EmailTemplateModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        defaultCompany={application?.company}
        defaultRole={application?.job_title}
        defaultContactName={recruiters[0]?.name}
      />

      {/* ATS Match & Keyword Analyzer Modal */}
      <AtsMatchModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        initialJobDescription={application?.description || ''}
        companyName={application?.company}
        roleTitle={application?.job_title}
      />
    </div>
  );
};
