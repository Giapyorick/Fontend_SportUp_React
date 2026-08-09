import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Venues } from '@/features/venues'
import { statuses } from '@/features/venues/data/data'

const venueSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/venues/')({
  validateSearch: venueSearchSchema,
  component: Venues,
})
