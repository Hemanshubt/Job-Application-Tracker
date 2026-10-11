import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { InterviewService } from '../services/interviewService';
import { validateRequest } from '../middleware/validate';
import {
  InterviewCreateSchema,
  InterviewUpdateSchema,
} from '../schemas/validation';

const router = Router();

// GET /api/interviews - List interviews (optional application_id query)
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const applicationId = req.query.application_id as string;
    const interviews = await InterviewService.list(userId, applicationId);

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/interviews/upcoming - Get upcoming interviews
router.get('/upcoming', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const upcoming = await InterviewService.getUpcoming(userId, limit);

    res.json({
      success: true,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/interviews - Create interview
router.post(
  '/',
  validateRequest(InterviewCreateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const interview = await InterviewService.create(userId, req.body);

      res.status(201).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/interviews/:id - Update interview
router.put(
  '/:id',
  validateRequest(InterviewUpdateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updated = await InterviewService.update(userId, req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Interview not found' },
        });
      }

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/interviews/:id - Delete interview
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deleted = await InterviewService.delete(userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Interview not found' },
      });
    }

    res.json({
      success: true,
      message: 'Interview successfully deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
