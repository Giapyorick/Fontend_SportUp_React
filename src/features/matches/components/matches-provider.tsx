import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Match } from '../data/schema'

type MatchDialogType = 'create' | 'update' | 'delete' | 'import'

type MatchContextType = {
  open: MatchDialogType | null
  setOpen: (str: MatchDialogType | null) => void
  currentRow: Match | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Match | null>>
}

const MatchesContext = React.createContext<MatchContextType | null>(null)

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<MatchDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Match | null>(null)

  return (
    <MatchesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MatchesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMatches = () => {
  const matchesContext = React.useContext(MatchesContext)

  if (!matchesContext) {
    throw new Error('useMatches has to be used within <MatchesContext>')
  }

  return matchesContext
}
