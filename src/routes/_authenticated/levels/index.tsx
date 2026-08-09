import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Levels } from '@/features/levels'
import { statuses } from '@/features/levels/data/data'

const levelsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/levels/')({
  validateSearch: levelsSearchSchema,
  component: Levels,
})
