import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Level } from '@/features/levels/data/schema'

type LevelDialogType = 'create' | 'update' | 'delete' | 'import'

type LevelContextType = {
  open: LevelDialogType | null
  setOpen: (str: LevelDialogType | null) => void
  currentRow: Level | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Level | null>>
}

const LevelsContext = React.createContext<LevelContextType | null>(null)

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<LevelDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Level | null>(null)

  return (
    <LevelsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </LevelsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLevels = () => {
  const levelsContext = React.useContext(LevelsContext)

  if (!levelsContext) {
    throw new Error('useLevels has to be used within <useLevels>')
  }

  return levelsContext
}
