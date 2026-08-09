import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Teams } from '@/features/teams'
import { statuses } from '@/features/teams/data/data'

const teamsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/teams/')({
  validateSearch: teamsSearchSchema,
  component: Teams,
})
