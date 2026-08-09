import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Team } from '../data/schema'

type TeamDialogType = 'create' | 'update' | 'delete' | 'import'

type TeamContextType = {
  open: TeamDialogType | null
  setOpen: (str: TeamDialogType | null) => void
  currentRow: Team | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Team | null>>
  teams: Team[]
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
}

const TeamsContext = React.createContext<TeamContextType | null>(null)

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TeamDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])

  return (
    <TeamsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, teams, setTeams }}
    >
      {children}
    </TeamsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTeams = () => {
  const teamsContext = React.useContext(TeamsContext)

  if (!teamsContext) {
    throw new Error('useTeams has to be used within <TeamsProvider>')
  }

  return teamsContext
}