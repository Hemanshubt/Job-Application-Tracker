import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { TaskService } from '../services/taskService';
import { validateRequest } from '../middleware/validate';
import { TaskCreateSchema, TaskUpdateSchema } from '../schemas/validation';

const router = Router();

// GET /api/tasks - List tasks
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { application_id, is_completed } = req.query;

    const tasks = await TaskService.list(userId, {
      applicationId: application_id as string,
      isCompleted: is_completed !== undefined ? is_completed === 'true' : undefined,
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create task
router.post(
  '/',
  validateRequest(TaskCreateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const task = await TaskService.create(userId, req.body);

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/tasks/:id/toggle - Toggle complete
router.patch('/:id/toggle', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const task = await TaskService.toggleComplete(userId, req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' },
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update task
router.put(
  '/:id',
  validateRequest(TaskUpdateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updated = await TaskService.update(userId, req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
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

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deleted = await TaskService.delete(userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' },
      });
    }

    res.json({
      success: true,
      message: 'Task successfully deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
