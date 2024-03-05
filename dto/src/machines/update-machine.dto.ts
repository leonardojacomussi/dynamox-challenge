import { z } from 'zod';

export type UpdateMachineDto = {
  name?: string;
  type?: string;
  inUse?: boolean;
};

export const updateMachineDto = z.object({
  name: z
    .string()
    .optional(),
  type: z
    .union([
      z.literal('Pump'),
      z.literal('Fan')]
    )
    .optional(),
  inUse: z
    .boolean()
    .optional()
});
