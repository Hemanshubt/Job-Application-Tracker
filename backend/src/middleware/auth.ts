import { Request, Response, NextFunction } from 'express';
import { supabase, isLiveSupabase } from '../config/supabase';
import { DEMO_USER_ID } from '../services/store';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; full_name?: string };
}

export const authenticateUser = async (
  req: AuthenticatedRequest, res: Response, next: NextFunction
) => {
  try {
    const production = process.env.NODE_ENV === 'production';
    const demoAllowed = !production && !isLiveSupabase;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (demoAllowed) {
        req.user = { id: DEMO_USER_ID, email: 'alex.developer@example.com', full_name: 'Alex Rivera' };
        return next();
      }
      return res.status(401).json({ success: false, error: {
        code: 'UNAUTHORIZED', message: 'Authorization token is required'
      } });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ success: false, error: {
        code: 'UNAUTHORIZED', message: 'Authorization token is required'
      } });
    }

    const demoToken = token === 'demo-token' || token.startsWith('demo-jwt-');
    if (demoToken) {
      if (demoAllowed) {
        req.user = { id: DEMO_USER_ID, email: 'alex.developer@example.com', full_name: 'Alex Rivera' };
        return next();
      }
      return res.status(401).json({ success: false, error: {
        code: 'INVALID_TOKEN', message: 'Demo tokens are not accepted'
      } });
    }

    if (!isLiveSupabase) {
      return res.status(401).json({ success: false, error: {
        code: 'INVALID_TOKEN', message: 'Supabase authentication is unavailable'
      } });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: {
        code: 'INVALID_TOKEN', message: 'Invalid or expired session token'
      } });
    }
    req.user = {
      id: user.id, email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
    };
    return next();
  } catch (error) {
    next(error);
  }
};
