import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RecruiterService } from '../services/recruiterService';
import { validateRequest } from '../middleware/validate';
import {
  RecruiterCreateSchema,
  RecruiterUpdateSchema,
} from '../schemas/validation';

const router = Router();

// GET /api/recruiters - List contacts
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const applicationId = req.query.application_id as string;
    const recruiters = await RecruiterService.list(userId, applicationId);

    res.json({
      success: true,
      data: recruiters,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/recruiters - Create contact
router.post(
  '/',
  validateRequest(RecruiterCreateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const recruiter = await RecruiterService.create(userId, req.body);

      res.status(201).json({
        success: true,
        data: recruiter,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/recruiters/:id - Update contact
router.put(
  '/:id',
  validateRequest(RecruiterUpdateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updated = await RecruiterService.update(userId, req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Recruiter not found' },
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

// DELETE /api/recruiters/:id - Delete contact
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deleted = await RecruiterService.delete(userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recruiter not found' },
      });
    }

    res.json({
      success: true,
      message: 'Recruiter successfully deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
