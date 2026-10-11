import { supabase, isLiveSupabase } from '../config/supabase';
import { Interview } from '../types';
import { localStore } from './store';
import { ActivityService } from './activityService';
import crypto from 'crypto';

export class InterviewService {
  static async list(userId: string, applicationId?: string) {
    if (isLiveSupabase) {
      try {
        let query = supabase
          .from('interviews')
          .select('*, application:applications(company, job_title)')
          .eq('user_id', userId)
          .order('scheduled_at', { ascending: true });

        if (applicationId) {
          query = query.eq('application_id', applicationId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as Interview[];
        }
      } catch (err) {
        console.warn('[InterviewService] Supabase list error:', err);
      }
    }

    return Array.from(localStore.interviews.values())
      .filter((i) => i.user_id === userId && (!applicationId || i.application_id === applicationId))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      .map((item) => {
        const app = localStore.applications.get(item.application_id);
        return {
          ...item,
          application: app ? { company: app.company, job_title: app.job_title } : undefined,
        };
      });
  }

  static async getUpcoming(userId: string, limit: number = 5) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select('*, application:applications(company, job_title)')
          .eq('user_id', userId)
          .eq('outcome', 'Scheduled')
          .gte('scheduled_at', now)
          .order('scheduled_at', { ascending: true })
          .limit(limit);

        if (!error && data) {
          return data as Interview[];
        }
      } catch (err) {
        console.warn('[InterviewService] Get upcoming error:', err);
      }
    }

    return Array.from(localStore.interviews.values())
      .filter((i) => i.user_id === userId && i.outcome === 'Scheduled' && i.scheduled_at >= now)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      .slice(0, limit)
      .map((item) => {
        const app = localStore.applications.get(item.application_id);
        return {
          ...item,
          application: app ? { company: app.company, job_title: app.job_title } : undefined,
        };
      });
  }

  static async create(userId: string, data: Partial<Interview>) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `int-${Date.now()}`;
    const now = new Date().toISOString();

    const newInterview: Interview = {
      id,
      application_id: data.application_id!,
      user_id: userId,
      round_name: data.round_name!,
      interview_type: data.interview_type || 'Technical',
      scheduled_at: data.scheduled_at!,
      duration_minutes: data.duration_minutes || 45,
      interviewer_names: data.interviewer_names || '',
      interviewer_emails: data.interviewer_emails || '',
      meeting_url: data.meeting_url || '',
      prep_notes: data.prep_notes || '',
      feedback: data.feedback || '',
      outcome: data.outcome || 'Scheduled',
      created_at: now,
      updated_at: now,
    };

    if (isLiveSupabase) {
      try {
        const { data: created, error } = await supabase
          .from('interviews')
          .insert(newInterview)
          .select('*, application:applications(company, job_title)')
          .single();

        if (!error && created) {
          const compName = (created as any).application?.company || 'Application';
          await ActivityService.log(
            userId,
            'INTERVIEW_SCHEDULED',
            `Interview: ${created.round_name}`,
            `Scheduled with ${compName} for ${new Date(created.scheduled_at).toLocaleDateString()}`,
            created.application_id,
            { round: created.round_name }
          );
          return created as Interview;
        }
      } catch (err) {
        console.warn('[InterviewService] Create error:', err);
      }
    }

    localStore.interviews.set(id, newInterview);
    const app = localStore.applications.get(newInterview.application_id);
    await ActivityService.log(
      userId,
      'INTERVIEW_SCHEDULED',
      `Interview: ${newInterview.round_name}`,
      `Scheduled with ${app?.company || 'Company'} for ${new Date(newInterview.scheduled_at).toLocaleDateString()}`,
      newInterview.application_id,
      { round: newInterview.round_name }
    );

    return {
      ...newInterview,
      application: app ? { company: app.company, job_title: app.job_title } : undefined,
    };
  }

  static async update(userId: string, id: string, data: Partial<Interview>) {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      try {
        const { data: updated, error } = await supabase
          .from('interviews')
          .update({ ...data, updated_at: now })
          .eq('id', id)
          .eq('user_id', userId)
          .select('*, application:applications(company, job_title)')
          .single();

        if (!error && updated) {
          return updated as Interview;
        }
      } catch (err) {
        console.warn('[InterviewService] Update error:', err);
      }
    }

    const existing = localStore.interviews.get(id);
    if (!existing || existing.user_id !== userId) return null;

    const updated = { ...existing, ...data, updated_at: now };
    localStore.interviews.set(id, updated);
    const app = localStore.applications.get(updated.application_id);
    return {
      ...updated,
      application: app ? { company: app.company, job_title: app.job_title } : undefined,
    };
  }

  static async delete(userId: string, id: string) {
    if (isLiveSupabase) {
      try {
        const { error } = await supabase
          .from('interviews')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.warn('[InterviewService] Delete error:', err);
      }
    }

    const existing = localStore.interviews.get(id);
    if (!existing || existing.user_id !== userId) return false;
    localStore.interviews.delete(id);
    return true;
  }
}
