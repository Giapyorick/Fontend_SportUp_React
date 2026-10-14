import api from './axios'

export type Level = {
  id: number
  name: string
  description?: string
  status?: string
}

export type CreateLevelDto = {
  name: string
  description?: string
  status?: string
}

// 1. Get all levels - Tự động bóc tách mảng từ mọi cấu trúc response Backend
export const getLevels = async (): Promise<Level[]> => {
  const res = await api.get('/Levels')
  const data = res.data

  // Nếu Backend trả về mảng trực tiếp: [...]
  if (Array.isArray(data)) {
    return data
  }

  // Nếu Backend trả về Object bọc mảng: { data: [...] } hoặc { items: [...] } hoặc { result: [...] }
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.result)) return data.result
  }

  return []
}

// 2. Get a level by id
export const getLevelById = async (id: number): Promise<Level> => {
  const response = await api.get(`/Levels/${id}`)
  return response.data
}

// 3. Create a new level
export const createLevel = async (data: CreateLevelDto): Promise<Level> => {
  const response = await api.post('/Levels', data)
  return response.data
}

// 4. Update an existing level
export const updateLevel = async (id: number, data: CreateLevelDto) => {
  const payload = {
    id,
    ...data,
  }

  const response = await api.put(`/Levels/${id}`, payload)
  return response.data
}

// 5. Delete a level by id
export const deleteLevel = async (id: number) => {
  const response = await api.delete(`/Levels/${id}`)
  return response.data
}

// 6. Delete multiple levels
export const deleteMultipleLevels = async (ids: number[]) => {
  const response = await api.post('/Levels/multi-delete', ids)
  return response.data
}

// 7. Import levels from Excel
export const importLevels = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/Levels/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
