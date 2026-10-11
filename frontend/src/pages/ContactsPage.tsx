import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  Building2,
  Trash2,
  Edit2,
  Clock,
} from 'lucide-react';
import { recruitersApi, applicationsApi } from '../lib/api';
import { Recruiter, Application } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const ContactsPage: React.FC = () => {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [deletingRecruiter, setDeletingRecruiter] = useState<Recruiter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<Recruiter>>({
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    linkedin_url: '',
    last_contact_date: '',
    next_followup_date: '',
    notes: '',
    application_id: '',
  });

  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recList, appList] = await Promise.all([
        recruitersApi.list(),
        applicationsApi.list({ limit: 100 }),
      ]);
      setRecruiters(recList);
      setApplications(appList.applications);
    } catch (err: any) {
      error('Failed to load recruiters', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingRecruiter(null);
    setForm({
      name: '',
      company: '',
      title: '',
      email: '',
      phone: '',
      linkedin_url: '',
      last_contact_date: new Date().toISOString().split('T')[0],
      next_followup_date: '',
      notes: '',
      application_id: applications[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Recruiter) => {
    setEditingRecruiter(rec);
    setForm({
      ...rec,
      last_contact_date: rec.last_contact_date || '',
      next_followup_date: rec.next_followup_date || '',
      application_id: rec.application_id || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      error('Name required', 'Please provide contact name.');
      return;
    }

    try {
      const payload = {
        ...form,
        application_id: form.application_id || null,
        last_contact_date: form.last_contact_date || null,
        next_followup_date: form.next_followup_date || null,
      };

      if (editingRecruiter) {
        await recruitersApi.update(editingRecruiter.id, payload);
        success('Contact Updated', `Saved changes for ${form.name}.`);
      } else {
        await recruitersApi.create(payload);
        success('Contact Saved', `Added ${form.name} to network.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Error saving contact', err.response?.data?.error?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecruiter) return;
    setIsDeleting(true);
    try {
      await recruitersApi.delete(deletingRecruiter.id);
      success('Contact Deleted', 'Removed contact record.');
      setDeletingRecruiter(null);
      loadData();
    } catch (err: any) {
      error('Failed to delete contact', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Recruiter & Contact Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize talent partners, referrals, follow-up dates, and correspondence notes.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>

      {isLoading ? (
        <div className="h-44 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
      ) : recruiters.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No recruiter contacts yet"
          description="Keep all your HR contacts, hiring managers, and headhunters organized here."
          actionLabel="Add First Contact"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiters.map((rec) => (
            <Card
              key={rec.id}
              className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                      {rec.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white tracking-tight">
                        {rec.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {rec.title || 'Recruiter'} {rec.company ? `• ${rec.company}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingRecruiter(rec)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  {rec.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`mailto:${rec.email}`} className="text-indigo-400 hover:underline truncate">
                        {rec.email}
                      </a>
                    </div>
                  )}
                  {rec.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rec.phone}</span>
                    </div>
                  )}
                  {rec.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <a
                        href={rec.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline truncate"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                {rec.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 line-clamp-3">
                    "{rec.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Last: {formatDate(rec.last_contact_date)}
                </span>
                {rec.next_followup_date && (
                  <span className="text-amber-400 font-medium">
                    Follow-up: {formatDate(rec.next_followup_date)}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecruiter ? 'Edit Contact' : 'Add Recruiter Contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Sarah Jenkins"
            value={form.name || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company"
              placeholder="e.g. Stripe, Linear"
              value={form.company || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
            />
            <Input
              label="Title / Role"
              placeholder="Senior Technical Recruiter"
              value={form.title || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="sjenkins@company.com"
              value={form.email || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={form.phone || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/username"
            value={form.linkedin_url || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, linkedin_url: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Last Contact Date"
              type="date"
              value={form.last_contact_date || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, last_contact_date: e.target.value }))}
            />
            <Input
              label="Next Follow-up Date"
              type="date"
              value={form.next_followup_date || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, next_followup_date: e.target.value }))}
            />
          </div>

          <Select
            label="Associate with Application (Optional)"
            value={form.application_id || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, application_id: e.target.value }))}
            options={[
              { value: '', label: 'None (General Network Contact)' },
              ...applications.map((a) => ({
                value: a.id,
                label: `${a.company} (${a.job_title})`,
              })),
            ]}
          />

          <Textarea
            label="Conversation Notes & Preferences"
            placeholder="Key talking points, compensation discussed, availability..."
            rows={2}
            value={form.notes || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRecruiter ? 'Save Changes' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingRecruiter)}
        onClose={() => setDeletingRecruiter(null)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Delete recruiter record for ${deletingRecruiter?.name}?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
