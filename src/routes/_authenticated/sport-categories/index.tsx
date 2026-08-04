import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Categories } from '@/features/sport-categories'
import { statuses } from '@/features/sport-categories/data/data'

const categoriesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/sport-categories/')({
  validateSearch: categoriesSearchSchema,
  component: Categories,
})
