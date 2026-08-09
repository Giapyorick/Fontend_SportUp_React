import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Venue } from '../data/schema'

type VenueDialogType = 'create' | 'update' | 'delete' | 'import'

type VenueContextType = {
  open: VenueDialogType | null
  setOpen: (str: VenueDialogType | null) => void
  currentRow: Venue | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Venue | null>>
}

const VenuesContext = React.createContext<VenueContextType | null>(null)

export function VenueProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<VenueDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Venue | null>(null)

  return (
    <VenuesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VenuesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVenues = () => {
  const venuesContext = React.useContext(VenuesContext)

  if (!venuesContext) {
    throw new Error('useVenues has to be used within <VenuesContext>')
  }

  return venuesContext
}
