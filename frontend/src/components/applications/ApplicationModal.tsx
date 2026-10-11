import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Application, ApplicationStatus, JobType, LocationType } from '../../types';
import { Star, FileText, Upload, ExternalLink } from 'lucide-react';
import { ResumeUpload } from '../ui/ResumeUpload';
import { useAuth } from '../../context/AuthContext';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Application>) => Promise<void>;
  initialData?: Application | null;
  defaultStatus?: ApplicationStatus;
  isLoading?: boolean;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultStatus = 'Applied',
  isLoading = false,
}) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<Partial<Application>>({
    company: '',
    job_title: '',
    location: '',
    location_type: 'Remote',
    job_type: 'Full-time',
    salary_min: undefined,
    salary_max: undefined,
    salary_currency: 'INR',
    job_url: '',
    status: defaultStatus,
    applied_date: new Date().toISOString().split('T')[0],
    deadline: '',
    description: '',
    notes: '',
    rating: 4,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        deadline: initialData.deadline || '',
      });
    } else {
      setFormData({
        company: '',
        job_title: '',
        location: '',
        location_type: 'Remote',
        job_type: 'Full-time',
        salary_min: undefined,
        salary_max: undefined,
        salary_currency: 'INR',
        job_url: '',
        status: defaultStatus,
        applied_date: new Date().toISOString().split('T')[0],
        deadline: '',
        description: '',
        notes: '',
        rating: 4,
      });
    }
    setErrors({});
  }, [initialData, defaultStatus, isOpen]);

  const handleChange = (
    field: keyof Application,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.company?.trim()) newErrors.company = 'Company name is required';
    if (!formData.job_title?.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.applied_date) newErrors.applied_date = 'Application date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...formData,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      deadline: formData.deadline || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Application' : 'Track New Job Application'}
      description="Record key details, compensation range, and stage of this opportunity."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company & Job Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            placeholder="e.g. Stripe, Linear, Vercel"
            value={formData.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            error={errors.company}
          />
          <Input
            label="Job Title *"
            placeholder="e.g. Senior Full Stack Engineer"
            value={formData.job_title || ''}
            onChange={(e) => handleChange('job_title', e.target.value)}
            error={errors.job_title}
          />
        </div>

        {/* Location & Types */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Location"
            placeholder="e.g. Bengaluru, KA / Remote (India)"
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          <Select
            label="Workplace Mode"
            value={formData.location_type || 'Remote'}
            onChange={(e) => handleChange('location_type', e.target.value as LocationType)}
            options={[
              { value: 'Remote', label: 'Remote' },
              { value: 'Hybrid', label: 'Hybrid' },
              { value: 'On-site', label: 'On-site' },
            ]}
          />
          <Select
            label="Employment Type"
            value={formData.job_type || 'Full-time'}
            onChange={(e) => handleChange('job_type', e.target.value as JobType)}
            options={[
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Internship', label: 'Internship' },
            ]}
          />
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Min Salary / Comp"
            type="number"
            placeholder="e.g. 1500000 (15 LPA)"
            value={formData.salary_min !== undefined && formData.salary_min !== null ? formData.salary_min : ''}
            onChange={(e) => handleChange('salary_min', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Max Salary / Comp"
            type="number"
            placeholder="e.g. 2400000 (24 LPA)"
            value={formData.salary_max !== undefined && formData.salary_max !== null ? formData.salary_max : ''}
            onChange={(e) => handleChange('salary_max', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Select
            label="Currency"
            value={formData.salary_currency || 'INR'}
            onChange={(e) => handleChange('salary_currency', e.target.value)}
            options={[
              { value: 'INR', label: 'INR (₹) - Lakhs / LPA' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'CAD', label: 'CAD ($)' },
            ]}
          />
        </div>

        {/* Status & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Pipeline Status"
            value={formData.status || 'Applied'}
            onChange={(e) => handleChange('status', e.target.value as ApplicationStatus)}
            options={[
              { value: 'Applied', label: 'Applied' },
              { value: 'Screening', label: 'Screening' },
              { value: 'Interview', label: 'Interview' },
              { value: 'Offer', label: 'Offer' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'Withdrawn', label: 'Withdrawn' },
            ]}
          />
          <Input
            label="Date Applied *"
            type="date"
            value={formData.applied_date || ''}
            onChange={(e) => handleChange('applied_date', e.target.value)}
            error={errors.applied_date}
          />
          <Input
            label="Deadline / Response Expected"
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => handleChange('deadline', e.target.value)}
          />
        </div>

        {/* Job URL & Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2">
            <Input
              label="Job Posting URL"
              placeholder="https://company.com/careers/role"
              value={formData.job_url || ''}
              onChange={(e) => handleChange('job_url', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Role Excitement / Fit
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange('rating', star)}
                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      (formData.rating || 3) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description & Personal Notes */}
        <Textarea
          label="Job Description Highlights / Scope"
          placeholder="Brief responsibilities, tech stack, team expectations..."
          rows={2}
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <Textarea
          label="Personal Notes & Strategy"
          placeholder="Referral name, talking points, salary research..."
          rows={2}
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
        />

        {/* Resume / CV Section: Select Master or Upload Tailored */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Resume / CV
            </label>

            {/* Quick Toggle if Master Resume is available in Profile */}
            {profile?.resume_url && (
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      resume_url: profile.resume_url,
                      resume_filename: profile.resume_filename || 'Master_Resume.pdf',
                    }));
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    formData.resume_url === profile.resume_url
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title="Use default resume saved in your profile settings"
                >
                  <FileText className="w-3 h-3" />
                  <span>Use Master CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (formData.resume_url === profile.resume_url) {
                      setFormData((prev) => ({
                        ...prev,
                        resume_url: undefined,
                        resume_filename: undefined,
                      }));
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    formData.resume_url !== profile.resume_url
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title="Upload a new tailored resume for this opportunity"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Tailored</span>
                </button>
              </div>
            )}
          </div>

          {/* State 1: Active Master Resume Attached */}
          {formData.resume_url && formData.resume_url === profile?.resume_url ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white truncate">
                      {formData.resume_filename || 'Master_Resume.pdf'}
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                      Master CV
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Attached from your Candidate Profile
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={formData.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700/80 text-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      resume_url: undefined,
                      resume_filename: undefined,
                    }));
                  }}
                  className="inline-flex items-center text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Detach
                </button>
              </div>
            </div>
          ) : (
            /* State 2: Upload Option (or Custom Tailored Resume Attached) */
            <ResumeUpload
              label=""
              description="Upload a tailored resume for this opportunity (PDF, DOCX up to 10MB)"
              resumeUrl={formData.resume_url}
              resumeFilename={formData.resume_filename}
              onUploadComplete={(url, filename) => {
                setFormData((prev) => ({
                  ...prev,
                  resume_url: url,
                  resume_filename: filename,
                }));
              }}
              onRemove={() => {
                setFormData((prev) => ({
                  ...prev,
                  resume_url: undefined,
                  resume_filename: undefined,
                }));
              }}
            />
          )}

          {/* Helpful helper if user hasn't configured a master CV yet */}
          {!profile?.resume_url && (
            <p className="text-[11px] text-slate-500 mt-1">
              💡 Tip: Save a default resume in <span className="text-indigo-400 font-medium">Settings → Candidate Profile</span> to 1-click select it for any application.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Track Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
