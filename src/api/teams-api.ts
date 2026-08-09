import api from './axios'
import { teamsSchema, type Team } from '@/features/teams/data/schema'
import { z } from 'zod'

export type CreateTeamDto = {
  name: string
  description: string
  status: string
  logoUrl?: string
  image?: File | FileList | null
}

// 1. Get all teams
export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get('/Teams')
  return z.array(teamsSchema).parse(response.data)
}

// 2. Create a new team
export const createTeam = async (data: CreateTeamDto): Promise<Team> => {
  const formData = new FormData()

  formData.append('Name', data.name)
  formData.append('Description', data.description)
  formData.append('Status', data.status)

  if (data.image) {
    const file = data.image instanceof FileList ? data.image[0] : data.image
    if (file) {
      formData.append('LogoUrl', file, file.name)
    }
  }

  const response = await api.post('/Teams', formData)
  return response.data
}

// 3. Update team
export const updateTeam = async (id: number, data: CreateTeamDto): Promise<void> => {
  const formData = new FormData()

  formData.append('Name', data.name)
  formData.append('Description', data.description)
  formData.append('Status', data.status)

  if (data.image) {
    const file = data.image instanceof FileList ? data.image[0] : data.image
    if (file) {
      formData.append('LogoUrl', file, file.name)
    }
  }

  const response = await api.put(`/Teams/${id}`, formData)
  return response.data
}

export const deleteTeam = async (id: number): Promise<void> => {
  const response = await api.delete(`/Teams/${id}`)
  return response.data
}

export const deleteMultipleTeams = async (ids: number[]) => {
  const response = await api.post('/Teams/multi-delete', ids)
  return response.data
}
export async function importTeamsApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/Teams/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}