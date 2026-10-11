import { supabase, isLiveSupabase } from '../config/supabase';
import { UserProfile } from '../types';
import { localStore, initialProfile } from './store';

export class ProfileService {
  static async get(userId: string, email?: string): Promise<UserProfile> {
    if (isLiveSupabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return data as UserProfile;
        }

        // If profile doesn't exist yet, create one
        if (error && error.code === 'PGRST116') {
          const newProfile = {
            id: userId,
            email: email || '',
            full_name: email?.split('@')[0] || 'User',
            avatar_url: '',
            headline: '',
            target_role: '',
            location: '',
            bio: '',
            preferences: {
              currency: 'USD',
              default_view: 'kanban',
              notifications_enabled: true,
              email_reminders: false,
              compact_cards: false,
            },
          };

          const { data: created } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (created) return created as UserProfile;
        }
      } catch (err) {
        console.warn('[ProfileService] Supabase get error:', err);
      }
    }

    let profile = localStore.profiles.get(userId);
    if (!profile) {
      profile = {
        ...initialProfile,
        id: userId,
        email: email || initialProfile.email,
      };
      localStore.profiles.set(userId, profile);
    }
    return profile;
  }

  static async update(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const now = new Date().toISOString();

    if (isLiveSupabase) {
      try {
        const { data: updated, error } = await supabase
          .from('profiles')
          .update({ ...data, updated_at: now })
          .eq('id', userId)
          .select()
          .single();

        if (!error && updated) {
          return updated as UserProfile;
        }
      } catch (err) {
        console.warn('[ProfileService] Update error:', err);
      }
    }

    const current = await this.get(userId);
    const updated: UserProfile = {
      ...current,
      ...data,
      preferences: {
        ...current.preferences,
        ...(data.preferences || {}),
      },
      updated_at: now,
    };
    localStore.profiles.set(userId, updated);
    return updated;
  }
}
