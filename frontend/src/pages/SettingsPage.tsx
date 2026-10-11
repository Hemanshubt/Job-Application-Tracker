import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { profileApi } from '../lib/api';
import { UserProfile } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { ResumeUpload } from '../components/ui/ResumeUpload';
import {
  User,
  Sliders,
  Bell,
  Shield,
  Save,
  LogOut,
  Sparkles,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState<Partial<UserProfile>>({
    full_name: '',
    headline: '',
    target_role: '',
    location: '',
    bio: '',
    resume_url: '',
    resume_filename: '',
    preferences: {
      currency: 'INR',
      default_view: 'kanban',
      notifications_enabled: true,
      email_reminders: false,
      compact_cards: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        target_role: profile.target_role || '',
        location: profile.location || '',
        bio: profile.bio || '',
        resume_url: profile.resume_url || '',
        resume_filename: profile.resume_filename || '',
        preferences: {
          currency: profile.preferences?.currency || 'INR',
          default_view: profile.preferences?.default_view || 'kanban',
          notifications_enabled: profile.preferences?.notifications_enabled ?? true,
          email_reminders: profile.preferences?.email_reminders ?? false,
          compact_cards: profile.preferences?.compact_cards ?? false,
        },
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await profileApi.update(form);
      await refreshProfile();
      success('Settings Saved', 'Your profile preferences have been updated.');
    } catch (err: any) {
      error('Failed to save settings', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your profile, target roles, reminder options, and display defaults.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Details */}
        <Card className="bg-slate-900/60 border-slate-800 space-y-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Candidate Profile
            </CardTitle>
            <CardDescription>
              Information used across your application records and exported resumes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Alex Rivera"
                value={form.full_name || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
              />
              <Input
                label="Headline"
                placeholder="Senior Full Stack & Systems Engineer"
                value={form.headline || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Roles"
                placeholder="Staff SWE / Lead Architect"
                value={form.target_role || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, target_role: e.target.value }))}
              />
              <Input
                label="Current Location"
                placeholder="e.g. Bengaluru, India (Open to Remote)"
                value={form.location || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <Textarea
              label="Bio & Career Objective"
              placeholder="Background summary, specialization, technologies, and salary range targets..."
              rows={3}
              value={form.bio || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            />

            {/* Master Resume Upload */}
            <div className="pt-3 border-t border-slate-800/80">
              <ResumeUpload
                label="Master Resume / CV"
                description="Upload your primary resume to use across job applications (PDF, DOCX up to 10MB)"
                resumeUrl={form.resume_url}
                resumeFilename={form.resume_filename}
                onUploadComplete={(url, filename) => {
                  setForm((prev) => ({
                    ...prev,
                    resume_url: url,
                    resume_filename: filename,
                  }));
                }}
                onRemove={() => {
                  setForm((prev) => ({
                    ...prev,
                    resume_url: '',
                    resume_filename: '',
                  }));
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card className="bg-slate-900/60 border-slate-800 space-y-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Application Display & Currency
            </CardTitle>
            <CardDescription>
              Formatting options for salary metrics and default layouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Preferred Salary Currency"
                value={form.preferences?.currency || 'INR'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, currency: e.target.value },
                  }))
                }
                options={[
                  { value: 'INR', label: 'INR (₹) - Indian Rupee (LPA)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD ($)' },
                ]}
              />

              <Select
                label="Default Pipeline View"
                value={form.preferences?.default_view || 'kanban'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, default_view: e.target.value as any },
                  }))
                }
                options={[
                  { value: 'kanban', label: 'Kanban Pipeline Board' },
                  { value: 'table', label: 'Tabular List' },
                  { value: 'cards', label: 'Grid Cards' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminders & External Notifications Documentation */}
        <Card className="bg-slate-900/60 border-slate-800 space-y-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Reminders & Notification Dispatch
            </CardTitle>
            <CardDescription>
              In-app reminders and external email/webhook alert configurations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.preferences?.notifications_enabled ?? true}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        notifications_enabled: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Enable in-app header reminder notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Displays bell badge alerts for interviews and pending tasks.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.preferences?.email_reminders ?? false}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        email_reminders: e.target.checked,
                      },
                    }))
                  }
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Send email alerts for upcoming interviews
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Requires SMTP or Resend credentials in backend environment variables.
                  </span>
                </div>
              </label>
            </div>

            {/* Notification Documentation Note */}
            <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>External Notification Setup Documentation:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                In-app reminders are active natively. To dispatch external emails or SMS (e.g. 2 hours before an interview round), configure <code className="text-indigo-300">RESEND_API_KEY</code> or <code className="text-indigo-300">SMTP_HOST</code> in <code className="text-indigo-300">backend/.env</code>. The backend task daemon automatically checks for tasks with <code className="text-indigo-300">reminder_at &lt;= NOW()</code> and sends webhook/email notifications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => signOut()}
            className="text-rose-400 hover:text-rose-300 gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>

          <Button type="submit" isLoading={isLoading} className="gap-2">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
