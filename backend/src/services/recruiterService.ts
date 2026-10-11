import { supabase, isLiveSupabase } from '../config/supabase';
import { Recruiter } from '../types';
import { localStore } from './store';
import { ActivityService } from './activityService';
import crypto from 'crypto';

export class RecruiterService {
  static async list(userId: string, applicationId?: string) {
    if (isLiveSupabase) {
      try {
        let query = supabase
          .from('recruiters')
          .select('*, application:applications(company, job_title)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (applicationId) {
          query = query.eq('application_id', applicationId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as Recruiter[];
        }
      } catch (err) {
        console.warn('[RecruiterService] Supabase list error:', err);
      }
    }

    return Array.from(localStore.recruiters.values())
      .filter((r) => r.user_id === userId && (!applicationId || r.application_id === applicationId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((item) => {
        const app = item.application_id ? localStore.applications.get(item.application_id) : undefined;
        return {
          ...item,
          application: app ? { company: app.company, job_title: app.job_title } : undefined,
        };
      });
  }

  static async create(userId: string, data: Partial<Recruiter>) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`;
    const now = new Date().toISOString();

    const newRecruiter: Recruiter = {
      id,
      user_id: userId,
      application_id: data.application_id || null,
      name: data.name!,
      company: data.company || '',
      title: data.title || '',
      email: data.email || '',
      phone: data.phone || '',
      linkedin_url: data.linkedin_url || '',
      last_contact_date: data.last_contact_date || null,
      next_followup_date: data.next_followup_date || null,
      notes: data.notes || '',
      created_at: now,
      updated_at: now,
    };

    if (isLiveSupabase) {
      try {
        const { data: created, error } = await supabase
          .from('recruiters')
          .insert(newRecruiter)
          .select('*, application:applications(company, job_title)')
          .single();

        if (!error && created) {
          await ActivityService.log(
            userId,
            'RECRUITER_CONTACTED',
            `Contact Added: ${created.name}`,
            `Added recruiter contact for ${created.company || 'general network'}`,
            created.application_id
          );
          return created as Recruiter;
        }
      } catch (err) {
        console.warn('[RecruiterService] Create error:', err);
      }
    }

    localStore.recruiters.set(id, newRecruiter);
    const app = newRecruiter.application_id ? localStore.applications.get(newRecruiter.application_id) : undefined;
    await ActivityService.log(
      userId,
      'RECRUITER_CONTACTED',
      `Contact Added: ${newRecruiter.name}`,
      `Added recruiter contact for ${newRecruiter.company || 'general network'}`,
      newRecruiter.application_id
    );

    return {
      ...newRecruiter,
      application: app ? { company: app.company, job_title: app.job_title } : undefined,
    };
  }

  static async update(userId: string, id: string, data: Partial<Recruiter>) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      try {
        const { data: updated, error } = await supabase
          .from('recruiters')
          .update({ ...data, updated_at: now })
          .eq('id', id)
          .eq('user_id', userId)
          .select('*, application:applications(company, job_title)')
          .single();

        if (!error && updated) {
          return updated as Recruiter;
        }
      } catch (err) {
        console.warn('[RecruiterService] Update error:', err);
      }
    }

    const existing = localStore.recruiters.get(id);
    if (!existing || existing.user_id !== userId) return null;

    const updated = { ...existing, ...data, updated_at: now };
    localStore.recruiters.set(id, updated);
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
          .from('recruiters')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.warn('[RecruiterService] Delete error:', err);
      }
    }

    const existing = localStore.recruiters.get(id);
    if (!existing || existing.user_id !== userId) return false;
    localStore.recruiters.delete(id);
    return true;
  }
}
