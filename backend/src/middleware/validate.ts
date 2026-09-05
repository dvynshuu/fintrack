import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Higher-order middleware to strictly validate request body with Zod schemas.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues: any[] = (err as any).issues || (err as any).errors || [];
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload parameters',
            details: issues.map((e: any) => ({
              path: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
              message: e.message
            })),
            status: 400
          }
        });
        return;
      }
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Malformed request content',
          status: 400
        }
      });
    }
  };
}
