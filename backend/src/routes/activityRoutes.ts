import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ActivityService } from '../services/activityService';

const router = Router();

// GET /api/activity - Recent activity timeline
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const applicationId = req.query.application_id as string;

    const activities = await ActivityService.list(userId, limit, applicationId);
    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
