import api from './axios'

// get all sportcategory

export const getCategory = async () => {
  const response = await api.get('/SportCategories')
  return response.data
}
export type CreateCategoryDto = {
  name: string
  description: string
  status: string
}

// create a new sportcategory

export const createCategory = async (data: CreateCategoryDto) => {
  const response = await api.post('/SportCategories', data)
  return response.data
}

// update an existing sportcategory

export const updateCategory = async (id: number, data: CreateCategoryDto) => {
  const payload = {
    id,
    ...data,
  }

  // eslint-disable-next-line no-console
  console.log(payload);

  const response = await api.put(`/SportCategories/${id}`, payload);

  return response.data;
}

// delete a sportcategory

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/SportCategories/${id}`)
  return response.data
}

// delete multiple sportcategory

export const deleteMultipleCategory = async (ids: number[]) => {
  const response = await api.post('/SportCategories/multi-delete', ids)
  return response.data
}

// import a file sportcategory

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