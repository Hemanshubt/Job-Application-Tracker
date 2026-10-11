import { Request, Response, NextFunction } from 'express';
import { supabase, isLiveSupabase } from '../config/supabase';
import { DEMO_USER_ID, localStore } from '../services/store';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development mode, if no header provided or demo mode, fallback to demo user
      if (!isLiveSupabase) {
        req.user = {
          id: DEMO_USER_ID,
          email: 'alex.developer@example.com',
          full_name: 'Alex Rivera',
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization token is required',
        },
      });
    }

    const token = authHeader.split(' ')[1];

    // Only allow demo tokens when running in local development mode without Supabase
    if (!isLiveSupabase && (token === 'demo-token' || token.startsWith('demo-jwt-'))) {
      req.user = {
        id: DEMO_USER_ID,
        email: 'alex.developer@example.com',
        full_name: 'Alex Rivera',
      };
      return next();
    }

    if (isLiveSupabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: error?.message || 'Invalid or expired session token',
          },
        });
      }

      req.user = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      };
      return next();
    }

    // Default development fallback
    req.user = {
      id: DEMO_USER_ID,
      email: 'alex.developer@example.com',
      full_name: 'Alex Rivera',
    };
    next();
  } catch (error) {
    next(error);
  }
};
