import { useState } from 'react'
import { toast } from 'sonner'
import { deleteCategory } from '@/api/categories-api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { CategoriesImportDialog } from './categories-import-dialog'
import { CategoriesMutateDrawer } from './categories-mutate-drawer'
import { useCategories } from './categories-provider'

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories()
  const [isLoading, setIsLoading] = useState(false)

  // The function handles deleting data.
  const handleDelete = async () => {
    if (!currentRow?.id) return

    setIsLoading(true)
    try {
      await deleteCategory(currentRow.id)

      toast.success(`Deleted successfully id : ${currentRow.id}`)

      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)

      window.location.reload()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while deleting:', error)
      toast.error('Failed to delete, please try again !')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CategoriesMutateDrawer
        key='category-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
      />

      <CategoriesImportDialog
        key='categories-import'
        open={open === 'import'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'import' : null)}
      />

      {/* Need new currentRow to render Update and Delete */}
      {currentRow && (
        <>
          {/* Drawer Update */}
          <CategoriesMutateDrawer
            key={`category-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          {/* Delete confirmation Dialog */}
          <ConfirmDialog
            key={`category-delete-${currentRow.id}`}
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            handleConfirm={handleDelete}
            isLoading={isLoading}
            className='max-w-md'
            title={`Delete this item: ${currentRow.name || currentRow.id} ?`}
            desc={
              <>
                You are about to delete{' '}
                <strong>{currentRow.name || `ID ${currentRow.id}`}</strong>.{' '}
                <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
