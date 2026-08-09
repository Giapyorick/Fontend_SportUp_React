import api from './axios'

export type DropdownOption = {
  id: number
  name: string
}

export type Match = {
  id?: number
  title: string
  sportCategoryId: number
  sportCategory?: DropdownOption | null
  venueId: number
  venue?: DropdownOption | null
  targetLevelId: number
  targetLevel?: DropdownOption | null
  startTime: string
  endTime: string
  totalSlots: number
  availableSlots: number
  pricePerSlot: number
  note?: string
  createdByUserId?: string
  createdAt?: string
}

// 1. Get all matches
export const getMatches = async (): Promise<Match[]> => {
  const response = await api.get('/Matches')
  return response.data
}

// 2. Get match by ID
export const getMatchById = async (id: number): Promise<Match> => {
  const response = await api.get(`/Matches/${id}`)
  return response.data
}

// 3. Create match
export const createMatch = async (data: Match): Promise<Match> => {
  const response = await api.post('/Matches', data)
  return response.data
}

// 4. Update match
export const updateMatch = async (id: number, data: Match): Promise<Match> => {
  const response = await api.put(`/Matches/${id}`, data)
  return response.data
}

// 5. Delete single match
export const deleteMatch = async (id: number) => {
  const response = await api.delete(`/Matches/${id}`)
  return response.data
}

// 6. Multi-delete matches
export const deleteMultipleMatches = async (ids: number[]) => {
  const response = await api.post('/Matches/multi-delete', ids)
  return response.data
}

// 7. Dropdown Options API Calls

export const getCategoryOptions = async (): Promise<DropdownOption[]> => {
  const response = await api.get('/Matches/options/categories')
  return response.data
}

export const getVenueOptions = async (): Promise<DropdownOption[]> => {
  const response = await api.get('/Matches/options/venues')
  return response.data
}

export const getLevelOptions = async (): Promise<DropdownOption[]> => {
  const response = await api.get('/Matches/options/levels')
  return response.data
}