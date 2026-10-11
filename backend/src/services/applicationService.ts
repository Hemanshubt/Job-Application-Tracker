import { supabase, isLiveSupabase } from '../config/supabase';
import { Application, ApplicationStatus } from '../types';
import { localStore } from './store';
import { ActivityService } from './activityService';
import crypto from 'crypto';

export interface ApplicationFilterOptions {
  search?: string;
  status?: string;
  location_type?: string;
  job_type?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class ApplicationService {
  static async list(userId: string, filters: ApplicationFilterOptions = {}) {
    const {
      search,
      status,
      location_type,
      job_type,
      sort_by = 'applied_date',
      order = 'desc',
      page = 1,
      limit = 50,
    } = filters;

    if (isLiveSupabase) {
      try {
        let query = supabase
          .from('applications')
          .select('*, interviews(*), tasks(*), recruiters(*)', { count: 'exact' })
          .eq('user_id', userId);

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }
        if (location_type && location_type !== 'all') {
          query = query.eq('location_type', location_type);
        }
        if (job_type && job_type !== 'all') {
          query = query.eq('job_type', job_type);
        }
        if (search) {
          query = query.or(`company.ilike.%${search}%,job_title.ilike.%${search}%,location.ilike.%${search}%`);
        }

        const ascending = order === 'asc';
        query = query.order(sort_by, { ascending });

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          return {
            applications: data as Application[],
            total: count || data.length,
            page,
            limit,
          };
        }
      } catch (err) {
        console.warn('[ApplicationService] Supabase list error, fallback to local store:', err);
      }
    }

    // Local Store implementation
    let apps = Array.from(localStore.applications.values()).filter(
      (app) => app.user_id === userId
    );

    if (status && status !== 'all') {
      apps = apps.filter((app) => app.status === status);
    }
    if (location_type && location_type !== 'all') {
      apps = apps.filter((app) => app.location_type === location_type);
    }
    if (job_type && job_type !== 'all') {
      apps = apps.filter((app) => app.job_type === job_type);
    }
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.job_title.toLowerCase().includes(q) ||
          (app.location && app.location.toLowerCase().includes(q))
      );
    }

    apps.sort((a, b) => {
      let valA: any = a[sort_by as keyof Application] || '';
      let valB: any = b[sort_by as keyof Application] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const total = apps.length;
    const startIndex = (page - 1) * limit;
    const paginated = apps.slice(startIndex, startIndex + limit).map((app) => {
      const ints = Array.from(localStore.interviews.values()).filter(
        (i) => i.application_id === app.id
      );
      const ts = Array.from(localStore.tasks.values()).filter(
        (t) => t.application_id === app.id
      );
      const recs = Array.from(localStore.recruiters.values()).filter(
        (r) => r.application_id === app.id
      );
      return {
        ...app,
        interviews: ints,
        tasks: ts,
        recruiters: recs,
      };
    });

    return {
      applications: paginated,
      total,
      page,
      limit,
    };
  }

  static async getById(userId: string, id: string) {
    if (isLiveSupabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, interviews(*), tasks(*), recruiters(*), notes:application_notes(*)')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return {
            ...data,
            notes_list: data.notes || [],
          } as Application;
        }
      } catch (err) {
        console.warn('[ApplicationService] Supabase getById error:', err);
      }
    }

    const app = localStore.applications.get(id);
    if (!app || app.user_id !== userId) {
      return null;
    }

    const interviews = Array.from(localStore.interviews.values()).filter(
      (i) => i.application_id === id
    );
    const tasks = Array.from(localStore.tasks.values()).filter(
      (t) => t.application_id === id
    );
    const recruiters = Array.from(localStore.recruiters.values()).filter(
      (r) => r.application_id === id
    );
    const notes_list = Array.from(localStore.notes.values()).filter(
      (n) => n.application_id === id
    );

    return {
      ...app,
      interviews,
      tasks,
      recruiters,
      notes_list,
    };
  }

  static async create(userId: string, data: Partial<Application>) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`;
    const now = new Date().toISOString();

    const newApp: Application = {
      id,
      user_id: userId,
      company: data.company!,
      job_title: data.job_title!,
      location: data.location || '',
      location_type: data.location_type || 'Remote',
      job_type: data.job_type || 'Full-time',
      salary_min: data.salary_min !== undefined ? data.salary_min : null,
      salary_max: data.salary_max !== undefined ? data.salary_max : null,
      salary_currency: data.salary_currency || 'INR',
      job_url: data.job_url || '',
      status: (data.status as ApplicationStatus) || 'Applied',
      applied_date: data.applied_date || now.split('T')[0],
      deadline: data.deadline || null,
      description: data.description || '',
      notes: data.notes || '',
      rating: data.rating || 3,
      resume_url: data.resume_url || null,
      resume_filename: data.resume_filename || null,
      created_at: now,
      updated_at: now,
    };

    if (isLiveSupabase) {
      try {
        const { data: created, error } = await supabase
          .from('applications')
          .insert({
            user_id: userId,
            company: newApp.company,
            job_title: newApp.job_title,
            location: newApp.location,
            location_type: newApp.location_type,
            job_type: newApp.job_type,
            salary_min: newApp.salary_min,
            salary_max: newApp.salary_max,
            salary_currency: newApp.salary_currency,
            job_url: newApp.job_url,
            status: newApp.status,
            applied_date: newApp.applied_date,
            deadline: newApp.deadline,
            description: newApp.description,
            notes: newApp.notes,
            rating: newApp.rating,
            resume_url: newApp.resume_url,
            resume_filename: newApp.resume_filename,
          })
          .select()
          .single();

        if (!error && created) {
          await ActivityService.log(
            userId,
            'APPLICATION_CREATED',
            `Applied to ${created.company}`,
            `Submitted application for ${created.job_title}`,
            created.id,
            { status: created.status }
          );
          return created as Application;
        }
      } catch (err) {
        console.warn('[ApplicationService] Create error:', err);
      }
    }

    localStore.applications.set(id, newApp);
    await ActivityService.log(
      userId,
      'APPLICATION_CREATED',
      `Applied to ${newApp.company}`,
      `Submitted application for ${newApp.job_title}`,
      newApp.id,
      { status: newApp.status }
    );
    return newApp;
  }

  static async update(userId: string, id: string, data: Partial<Application>) {
    const existing = await this.getById(userId, id);
    if (!existing) {
      return null;
    }

    const updatedNow = new Date().toISOString();
    const oldStatus = existing.status;
    const newStatus = data.status || oldStatus;

    if (isLiveSupabase) {
      try {
        const { data: updated, error } = await supabase
          .from('applications')
          .update({
            ...data,
            updated_at: updatedNow,
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && updated) {
          if (oldStatus !== newStatus) {
            await ActivityService.log(
              userId,
              'STATUS_CHANGE',
              `Moved to ${newStatus}`,
              `${updated.company} status changed from ${oldStatus} to ${newStatus}`,
              id,
              { old_status: oldStatus, new_status: newStatus }
            );
          }
          return updated as Application;
        }
      } catch (err) {
        console.warn('[ApplicationService] Update error:', err);
      }
    }

    const updatedItem: Application = {
      ...existing,
      ...data,
      updated_at: updatedNow,
    };
    localStore.applications.set(id, updatedItem);

    if (oldStatus !== newStatus) {
      await ActivityService.log(
        userId,
        'STATUS_CHANGE',
        `Moved to ${newStatus}`,
        `${updatedItem.company} status changed from ${oldStatus} to ${newStatus}`,
        id,
        { old_status: oldStatus, new_status: newStatus }
      );
    }

    return updatedItem;
  }

  static async updateStatus(userId: string, id: string, status: ApplicationStatus) {
    return this.update(userId, id, { status });
  }

  static async delete(userId: string, id: string) {
    const existing = await this.getById(userId, id);
    if (!existing) {
      return false;
    }

    if (isLiveSupabase) {
      try {
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) {
          return true;
        }
      } catch (err) {
        console.warn('[ApplicationService] Delete error:', err);
      }
    }

    localStore.applications.delete(id);
    // Cascade remove related items
    for (const [intId, item] of localStore.interviews) {
      if (item.application_id === id) localStore.interviews.delete(intId);
    }
    for (const [taskId, item] of localStore.tasks) {
      if (item.application_id === id) localStore.tasks.delete(taskId);
    }
    for (const [noteId, item] of localStore.notes) {
      if (item.application_id === id) localStore.notes.delete(noteId);
    }
    return true;
  }
}
