import api from './axios'

export type Venue = {
  id: number
  name: string
  address: string
  mapUrl?: string
  status?: string
}

export type CreateVenueDto = {
  name: string
  address: string
  mapUrl?: string
  status?: string
}

// 1. Get all venues
export const getVenues = async (): Promise<Venue[]> => {
  const response = await api.get('/Venues')
  return response.data
}

// 2. Get single venue by ID
export const getVenueById = async (id: number): Promise<Venue> => {
  const response = await api.get(`/Venues/${id}`)
  return response.data
}

// 3. Create a new venue
export const createVenue = async (data: CreateVenueDto): Promise<Venue> => {
  const response = await api.post('/Venues', data)
  return response.data
}

// 4. Update an existing venue
export const updateVenue = async (
  id: number,
  data: CreateVenueDto
): Promise<Venue> => {
  const payload = {
    id,
    ...data,
  }

  const response = await api.put(`/Venues/${id}`, payload)
  return response.data
}

// 5. Delete a single venue
export const deleteVenue = async (id: number) => {
  const response = await api.delete(`/Venues/${id}`)
  return response.data
}

// 6. Delete multiple venues
export const deleteMultipleVenues = async (ids: number[]) => {
  const response = await api.post('/Venues/multi-delete', ids, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

// 7. Import venues from Excel file
export const importVenues = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/Venues/import', formData)
  return response.data
}
