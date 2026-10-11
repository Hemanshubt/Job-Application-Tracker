import { supabase, isLiveSupabase } from '../config/supabase';
import { Task } from '../types';
import { localStore } from './store';
import { ActivityService } from './activityService';
import crypto from 'crypto';

export class TaskService {
  static async list(userId: string, filters?: { applicationId?: string; isCompleted?: boolean }) {
    if (isLiveSupabase) {
      try {
        let query = supabase
          .from('tasks')
          .select('*, application:applications(company, job_title)')
          .eq('user_id', userId)
          .order('due_date', { ascending: true, nullsFirst: false });

        if (filters?.applicationId) {
          query = query.eq('application_id', filters.applicationId);
        }
        if (filters?.isCompleted !== undefined) {
          query = query.eq('is_completed', filters.isCompleted);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as Task[];
        }
      } catch (err) {
        console.warn('[TaskService] Supabase list error:', err);
      }
    }

    return Array.from(localStore.tasks.values())
      .filter((t) => {
        if (t.user_id !== userId) return false;
        if (filters?.applicationId && t.application_id !== filters.applicationId) return false;
        if (filters?.isCompleted !== undefined && t.is_completed !== filters.isCompleted) return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .map((item) => {
        const app = item.application_id ? localStore.applications.get(item.application_id) : undefined;
        return {
          ...item,
          application: app ? { company: app.company, job_title: app.job_title } : undefined,
        };
      });
  }

  static async create(userId: string, data: Partial<Task>) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      id,
      user_id: userId,
      application_id: data.application_id || null,
      title: data.title!,
      description: data.description || '',
      task_type: data.task_type || 'General',
      priority: data.priority || 'Medium',
      due_date: data.due_date || null,
      is_completed: Boolean(data.is_completed),
      completed_at: data.is_completed ? now : null,
      reminder_at: data.reminder_at || null,
      created_at: now,
      updated_at: now,
    };

    if (isLiveSupabase) {
      try {
        const { data: created, error } = await supabase
          .from('tasks')
          .insert(newTask)
          .select('*, application:applications(company, job_title)')
          .single();

        if (!error && created) {
          await ActivityService.log(
            userId,
            'TASK_CREATED',
            `Task Created: ${created.title}`,
            `Added priority ${created.priority} task`,
            created.application_id
          );
          return created as Task;
        }
      } catch (err) {
        console.warn('[TaskService] Create error:', err);
      }
    }

    localStore.tasks.set(id, newTask);
    const app = newTask.application_id ? localStore.applications.get(newTask.application_id) : undefined;
    await ActivityService.log(
      userId,
      'TASK_CREATED',
      `Task Created: ${newTask.title}`,
      `Added priority ${newTask.priority} task`,
      newTask.application_id
    );

    return {
      ...newTask,
      application: app ? { company: app.company, job_title: app.job_title } : undefined,
    };
  }

  static async toggleComplete(userId: string, id: string) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      try {
        const { data: existing } = await supabase
          .from('tasks')
          .select('is_completed, title, application_id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (existing) {
          const nextState = !existing.is_completed;
          const { data: updated, error } = await supabase
            .from('tasks')
            .update({
              is_completed: nextState,
              completed_at: nextState ? now : null,
              updated_at: now,
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select('*, application:applications(company, job_title)')
            .single();

          if (!error && updated) {
            if (nextState) {
              await ActivityService.log(
                userId,
                'TASK_COMPLETED',
                `Task Done: ${existing.title}`,
                'Marked task as completed',
                existing.application_id
              );
            }
            return updated as Task;
          }
        }
      } catch (err) {
        console.warn('[TaskService] Toggle error:', err);
      }
    }

    const existing = localStore.tasks.get(id);
    if (!existing || existing.user_id !== userId) return null;

    const nextState = !existing.is_completed;
    const updated: Task = {
      ...existing,
      is_completed: nextState,
      completed_at: nextState ? now : null,
      updated_at: now,
    };
    localStore.tasks.set(id, updated);

    if (nextState) {
      await ActivityService.log(
        userId,
        'TASK_COMPLETED',
        `Task Done: ${existing.title}`,
        'Marked task as completed',
        existing.application_id
      );
    }

    const app = updated.application_id ? localStore.applications.get(updated.application_id) : undefined;
    return {
      ...updated,
      application: app ? { company: app.company, job_title: app.job_title } : undefined,
    };
  }

  static async update(userId: string, id: string, data: Partial<Task>) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      try {
        const { data: updated, error } = await supabase
          .from('tasks')
          .update({ ...data, updated_at: now })
          .eq('id', id)
          .eq('user_id', userId)
          .select('*, application:applications(company, job_title)')
          .single();

        if (!error && updated) {
          return updated as Task;
        }
      } catch (err) {
        console.warn('[TaskService] Update error:', err);
      }
    }

    const existing = localStore.tasks.get(id);
    if (!existing || existing.user_id !== userId) return null;

    const updated = { ...existing, ...data, updated_at: now };
    localStore.tasks.set(id, updated);
    const app = updated.application_id ? localStore.applications.get(updated.application_id) : undefined;
    return {
      ...updated,
      application: app ? { company: app.company, job_title: app.job_title } : undefined,
    };
  }

  static async delete(userId: string, id: string) {
    if (isLiveSupabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.warn('[TaskService] Delete error:', err);
      }
    }

    const existing = localStore.tasks.get(id);
    if (!existing || existing.user_id !== userId) return false;
    localStore.tasks.delete(id);
    return true;
  }
}
