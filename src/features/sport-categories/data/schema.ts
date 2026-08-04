import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const categoriesSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.string().optional().default('active'),
})

export type Category = z.infer<typeof categoriesSchema>
