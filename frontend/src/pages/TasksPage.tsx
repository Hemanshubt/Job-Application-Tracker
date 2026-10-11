import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Trash2,
  Edit2,
  Filter,
} from 'lucide-react';
import { tasksApi, applicationsApi } from '../lib/api';
import { Task, Application, TaskPriority, TaskType } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { formatDate, formatDateTime } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter tab: 'all' | 'pending' | 'overdue' | 'completed'
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form
  const [form, setForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    task_type: 'Interview Prep',
    priority: 'Medium',
    due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    application_id: '',
  });

  const { success, error } = useToast();

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [taskList, appList] = await Promise.all([
        tasksApi.list(),
        applicationsApi.list({ limit: 100 }),
      ]);
      setTasks(taskList);
      setApplications(appList.applications);
    } catch (err: any) {
      error('Failed to load tasks', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      task_type: 'Interview Prep',
      priority: 'Medium',
      due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      application_id: applications[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setForm({
      ...t,
      due_date: t.due_date ? new Date(t.due_date).toISOString().slice(0, 16) : '',
      application_id: t.application_id || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      error('Title required', 'Please provide a task title.');
      return;
    }

    try {
      const payload = {
        ...form,
        application_id: form.application_id || null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };

      if (editingTask) {
        await tasksApi.update(editingTask.id, payload);
        success('Task Updated', 'Saved changes.');
      } else {
        await tasksApi.create(payload);
        success('Task Created', `Added "${form.title}" to to-do list.`);
      }

      setIsModalOpen(false);
      loadTasks();
    } catch (err: any) {
      error('Error saving task', err.response?.data?.error?.message || err.message);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await tasksApi.toggle(id);
      success(
        updated.is_completed ? 'Task Completed' : 'Task Reopened',
        `"${updated.title}" status changed.`
      );
      loadTasks();
    } catch (err: any) {
      error('Failed to toggle task', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await tasksApi.delete(deletingTask.id);
      success('Task Deleted', 'Removed action item.');
      setDeletingTask(null);
      loadTasks();
    } catch (err: any) {
      error('Failed to delete task', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const now = new Date();
  const filteredTasks = tasks.filter((t) => {
    if (filterTab === 'pending') return !t.is_completed;
    if (filterTab === 'completed') return t.is_completed;
    if (filterTab === 'overdue') {
      return !t.is_completed && t.due_date && new Date(t.due_date) < now;
    }
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const overdueCount = tasks.filter((t) => !t.is_completed && t.due_date && new Date(t.due_date) < now).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tasks & Action Reminders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stay on top of thank-you emails, DSA review deadlines, and salary negotiation prep.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        {[
          { key: 'all', label: 'All Tasks', count: tasks.length },
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'overdue', label: 'Overdue', count: overdueCount },
          { key: 'completed', label: 'Completed', count: tasks.filter((t) => t.is_completed).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filterTab === tab.key
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                tab.key === 'overdue' && tab.count > 0
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-slate-700/80 text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-40 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match this filter"
          description="Everything is in order! Click Add Task to create a new reminder or milestone."
          actionLabel="Create Action Item"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue =
              !task.is_completed && task.due_date && new Date(task.due_date) < now;

            return (
              <Card
                key={task.id}
                className={`bg-slate-900/60 border-slate-800 flex items-center justify-between p-4 gap-4 transition-all ${
                  isOverdue ? 'border-rose-500/30 bg-rose-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`h-5 w-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      task.is_completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-950'
                    }`}
                  >
                    {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`font-semibold text-sm tracking-tight ${
                          task.is_completed
                            ? 'line-through text-slate-500'
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px] py-0 text-slate-400">
                        {task.task_type}
                      </Badge>
                      {task.application?.company && (
                        <span className="text-[11px] text-indigo-400 font-medium">
                          • {task.application.company}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                      {task.due_date && (
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-400 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {isOverdue ? 'Overdue: ' : 'Due: '}
                          {formatDateTime(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge priority={task.priority} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Action Item' : 'Create Task / Reminder'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Prepare system design presentation for Stripe"
            value={form.title || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Task Category"
              value={form.task_type || 'Interview Prep'}
              onChange={(e) => setForm((prev) => ({ ...prev, task_type: e.target.value as TaskType }))}
              options={[
                { value: 'Interview Prep', label: 'Interview Prep' },
                { value: 'Follow-up', label: 'Follow-up' },
                { value: 'Application Deadline', label: 'Application Deadline' },
                { value: 'Thank You Note', label: 'Thank You Note' },
                { value: 'Offer Review', label: 'Offer Review' },
                { value: 'General', label: 'General' },
              ]}
            />
            <Select
              label="Priority"
              value={form.priority || 'Medium'}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={form.due_date || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
            />
            <Select
              label="Associate Application (Optional)"
              value={form.application_id || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, application_id: e.target.value }))}
              options={[
                { value: '', label: 'General (No Company)' },
                ...applications.map((a) => ({
                  value: a.id,
                  label: `${a.company} (${a.job_title})`,
                })),
              ]}
            />
          </div>

          <Textarea
            label="Details & Deliverables"
            placeholder="Checklist, links, questions, negotiation targets..."
            rows={2}
            value={form.description || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Remove "${deletingTask?.title}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
