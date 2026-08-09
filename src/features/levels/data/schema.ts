import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const levelsSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional().default(''),
  status: z.string().optional().default('active'),
})

export type Level = z.infer<typeof levelsSchema>
