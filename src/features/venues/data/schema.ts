import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const venuesSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  mapUrl: z.string().optional().default(''),
  status: z.string().optional().default('Active'),
})

export type Venue = z.infer<typeof venuesSchema>
