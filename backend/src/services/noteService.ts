import { supabase, isLiveSupabase } from '../config/supabase';
import { ApplicationNote } from '../types';
import { localStore } from './store';
import { ActivityService } from './activityService';
import crypto from 'crypto';

export class NoteService {
  static async list(userId: string, applicationId: string) {
    if (isLiveSupabase) {
      try {
        const { data, error } = await supabase
          .from('application_notes')
          .select('*')
          .eq('user_id', userId)
          .eq('application_id', applicationId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as ApplicationNote[];
        }
      } catch (err) {
        console.warn('[NoteService] Supabase list error:', err);
      }
    }

    return Array.from(localStore.notes.values())
      .filter((n) => n.user_id === userId && n.application_id === applicationId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async create(userId: string, applicationId: string, content: string) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`;
    const now = new Date().toISOString();

    const newNote: ApplicationNote = {
      id,
      application_id: applicationId,
      user_id: userId,
      content,
      created_at: now,
      updated_at: now,
    };

    if (isLiveSupabase) {
      try {
        const { data: created, error } = await supabase
          .from('application_notes')
          .insert(newNote)
          .select()
          .single();

        if (!error && created) {
          await ActivityService.log(
            userId,
            'NOTE_ADDED',
            'Added Personal Note',
            content.length > 50 ? `${content.substring(0, 50)}...` : content,
            applicationId
          );
          return created as ApplicationNote;
        }
      } catch (err) {
        console.warn('[NoteService] Create error:', err);
      }
    }

    localStore.notes.set(id, newNote);
    await ActivityService.log(
      userId,
      'NOTE_ADDED',
      'Added Personal Note',
      content.length > 50 ? `${content.substring(0, 50)}...` : content,
      applicationId
    );

    return newNote;
  }

  static async delete(userId: string, id: string) {
    if (isLiveSupabase) {
      try {
        const { error } = await supabase
          .from('application_notes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.warn('[NoteService] Delete error:', err);
      }
    }

    const existing = localStore.notes.get(id);
    if (!existing || existing.user_id !== userId) return false;
    localStore.notes.delete(id);
    return true;
  }
}
