import api from './axios'

export type SportCategory = {
  id: number
  name: string
  description?: string
  status?: string
}

export type CreateCategoryDto = {
  name: string
  description?: string
  status?: string
}

// 1. Get all sport categories
export const getCategory = async (): Promise<SportCategory[]> => {
  const response = await api.get('/SportCategories')
  return response.data
}

// 2. Create a new sport category
export const createCategory = async (
  data: CreateCategoryDto
): Promise<SportCategory> => {
  const response = await api.post('/SportCategories', data)
  return response.data
}

// 3. Update an existing sport category
export const updateCategory = async (
  id: number,
  data: CreateCategoryDto
): Promise<SportCategory> => {
  const payload = {
    id,
    ...data,
  }

  const response = await api.put(`/SportCategories/${id}`, payload)
  return response.data
}

// 4. Delete a sport category
export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/SportCategories/${id}`)
  return response.data
}

// 5. Delete multiple sport categories
export const deleteMultipleCategory = async (ids: number[]) => {
  const response = await api.post('/SportCategories/multi-delete', ids)
  return response.data
}

// 6. Import sport categories from Excel file
export const importSportCategories = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/SportCategories/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
