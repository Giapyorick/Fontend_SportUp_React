// teams/data/schema.ts
import { z } from 'zod'

export const teamStatusEnum = z.enum(['active', 'inactive'])

export const teamsSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Tên đội bóng không được để trống'),
  description: z.string().default(''),
  logoUrl: z.string().default(''),
  createdAt: z.coerce.date(),
  status: teamStatusEnum.default('active'),
})

export type Team = z.infer<typeof teamsSchema>