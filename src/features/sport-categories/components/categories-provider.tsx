import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Category } from '../data/schema'

type CategoryDialogType = 'create' | 'update' | 'delete' | 'import'

type CategoryContextType = {
  open: CategoryDialogType | null
  setOpen: (str: CategoryDialogType | null) => void
  currentRow: Category | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Category | null>>
}

const CategoriessContext = React.createContext<CategoryContextType | null>(null)

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Category | null>(null)

  return (
    <CategoriessContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CategoriessContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCategories = () => {
  const categoriessContext = React.useContext(CategoriessContext)

  if (!categoriessContext) {
    throw new Error('useCategories has to be used within <CategoriessContext>')
  }

  return categoriessContext
}
