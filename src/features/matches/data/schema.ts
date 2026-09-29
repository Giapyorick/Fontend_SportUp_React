import { z } from 'zod'

export const matchSchema = z.object({
  id: z.number(),
  title: z.string(),

  sportCategoryId: z.number(),
  sportCategory: z
    .object({
      id: z.number().optional(),
      name: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),

  venueId: z.number(),
  venue: z
    .object({
      id: z.number().optional(),
      name: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),

  targetLevelId: z.number(),
  targetLevel: z
    .object({
      id: z.number().optional(),
      name: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),

  startTime: z.string(),
  endTime: z.string(),

  totalSlots: z.number().min(1, 'Total slots must be at least 1.'),
  availableSlots: z.number().min(0, 'Available slots cannot be negative.'),
  pricePerSlot: z.number().min(0, 'Price cannot be negative.'),
  note: z.string().optional().nullable(),

  createdByUserId: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
})

export type Match = z.infer<typeof matchSchema>
