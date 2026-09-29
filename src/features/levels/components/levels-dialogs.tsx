import { useState } from 'react'
import { toast } from 'sonner'
import { deleteLevel } from '@/api/levels-api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { LevelsImportDialog } from './levels-import-dialog'
import { LevelsMutateDrawer } from './levels-mutate-drawer'
import { useLevels } from './levels-provider'

type LevelsDialogsProps = {
  onSuccess?: () => void | Promise<void>
}

export function LevelsDialogs({ onSuccess }: LevelsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useLevels()
  const [isLoading, setIsLoading] = useState(false)

  // The function handles deleting data.
  const handleDelete = async () => {
    if (!currentRow?.id) return

    setIsLoading(true)
    try {
      await deleteLevel(currentRow.id)

      toast.success(`Deleted successfully id : ${currentRow.id}`)

      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)

      if (onSuccess) {
        await onSuccess()
      }
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
      <LevelsMutateDrawer
        key='level-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
        onSuccess={onSuccess}
      />

      <LevelsImportDialog
        key='levels-import'
        open={open === 'import'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'import' : null)}
        onSuccess={onSuccess}
      />

      {/* Need new currentRow to render Update and Delete */}
      {currentRow && (
        <>
          {/* Drawer Update */}
          <LevelsMutateDrawer
            key={`level-update-${currentRow.id}`}
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
            onSuccess={onSuccess}
          />

          {/* Delete confirmation Dialog */}
          <ConfirmDialog
            key={`level-delete-${currentRow.id}`}
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
