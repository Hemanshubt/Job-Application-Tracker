import { supabase, isLiveSupabase } from '../config/supabase';
import { ActivityLog } from '../types';
import { localStore } from './store';
import crypto from 'crypto';

export class ActivityService {
  static async log(
    userId: string,
    actionType: string,
    title: string,
    description?: string,
    applicationId?: string | null,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    const activityItem: ActivityLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      application_id: applicationId || null,
      action_type: actionType,
      title,
      description,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    if (isLiveSupabase) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .insert({
            user_id: userId,
            application_id: applicationId || null,
            action_type: actionType,
            title,
            description,
            metadata: metadata || {},
          })
          .select()
          .single();

        if (error) {
          console.warn('[ActivityService] Supabase log failed, storing in memory:', error.message);
        } else if (data) {
          return data as ActivityLog;
        }
      } catch (err) {
        console.warn('[ActivityService] Log error:', err);
      }
    }

    localStore.activity.unshift(activityItem);
    // Keep max 100 recent
    if (localStore.activity.length > 100) {
      localStore.activity.pop();
    }
    return activityItem;
  }

  static async list(
    userId: string,
    limit: number = 20,
    applicationId?: string
  ): Promise<ActivityLog[]> {
    if (isLiveSupabase) {
      try {
        let query = supabase
          .from('activity_logs')
          .select('*, application:applications(company, job_title)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (applicationId) {
          query = query.eq('application_id', applicationId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as ActivityLog[];
        }
      } catch (err) {
        console.warn('[ActivityService] List error:', err);
      }
    }

    return localStore.activity
      .filter((a) => a.user_id === userId && (!applicationId || a.application_id === applicationId))
      .slice(0, limit)
      .map((item) => {
        const app = item.application_id ? localStore.applications.get(item.application_id) : undefined;
        return {
          ...item,
          application: app ? { company: app.company, job_title: app.job_title } : undefined,
        };
      });
  }
}
