import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApplicationService } from '../services/applicationService';
import { validateRequest } from '../middleware/validate';
import {
  ApplicationCreateSchema,
  ApplicationUpdateSchema,
} from '../schemas/validation';

const router = Router();

// GET /api/applications - List with filters & pagination
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      search,
      status,
      location_type,
      job_type,
      sort_by,
      order,
      page,
      limit,
    } = req.query;

    const result = await ApplicationService.list(userId, {
      search: search as string,
      status: status as string,
      location_type: location_type as string,
      job_type: job_type as string,
      sort_by: sort_by as string,
      order: (order as 'asc' | 'desc') || 'desc',
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/:id - Get application details
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const application = await ApplicationService.getById(userId, req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' },
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/applications - Create application
router.post(
  '/',
  validateRequest(ApplicationCreateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const application = await ApplicationService.create(userId, req.body);

      res.status(201).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/applications/:id - Update application
router.put(
  '/:id',
  validateRequest(ApplicationUpdateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updated = await ApplicationService.update(userId, req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found' },
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

// PATCH /api/applications/:id/status - Quick status update (for Kanban)
router.patch(
  '/:id/status',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Status is required' },
        });
      }

      const updated = await ApplicationService.updateStatus(userId, req.params.id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found' },
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

// DELETE /api/applications/:id - Delete application
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deleted = await ApplicationService.delete(userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' },
      });
    }

    res.json({
      success: true,
      message: 'Application successfully deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
