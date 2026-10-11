import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ProfileService } from '../services/profileService';
import { validateRequest } from '../middleware/validate';
import { ProfileUpdateSchema } from '../schemas/validation';

const router = Router();

// GET /api/profile - Get current user profile
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const profile = await ProfileService.get(userId, req.user?.email);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/profile - Update current user profile
router.put(
  '/',
  validateRequest(ProfileUpdateSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updated = await ProfileService.update(userId, req.body);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
