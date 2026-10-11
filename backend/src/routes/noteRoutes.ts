import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { NoteService } from '../services/noteService';
import { validateRequest } from '../middleware/validate';
import { NoteCreateSchema } from '../schemas/validation';

const router = Router();

// GET /api/notes - List notes for application
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const applicationId = req.query.application_id as string;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'application_id is required' },
      });
    }

    const notes = await NoteService.list(userId, applicationId);
    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/notes - Create note
router.post(
  '/',
  validateRequest(NoteCreateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { application_id, content } = req.body;
      const note = await NoteService.create(userId, application_id, content);

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deleted = await NoteService.delete(userId, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Note not found' },
      });
    }

    res.json({
      success: true,
      message: 'Note successfully deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
