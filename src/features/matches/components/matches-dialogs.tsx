import { useState } from 'react'
import { toast } from 'sonner'
import { deleteMatch } from '@/api/matches-api'
import { ConfirmDialog } from '@/components/confirm-dialog'
//import { MatchesImportDialog } from './matches-import-dialog'
import { MatchesMutateDrawer } from './matches-mutate-drawer'
import { useMatches } from './matches-provider'

type MatchesDialogsProps = {
  onSuccess?: () => void | Promise<void>
}

export function MatchesDialogs({ onSuccess }: MatchesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useMatches()
  const [isLoading, setIsLoading] = useState(false)

  // The function handles deleting data.
  const handleDelete = async () => {
    if (!currentRow?.id) return

    setIsLoading(true)
    try {
      await deleteMatch(currentRow.id)

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
      <MatchesMutateDrawer
        key='match-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
        onSuccess={onSuccess}
      />

      {/* <MatchesImportDialog
        key='matches-import'
        open={open === 'import'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'import' : null)}
        onSuccess={onSuccess}
      /> */}

      {/* Need new currentRow to render Update and Delete */}
      {currentRow && (
        <>
          {/* Drawer Update */}
          <MatchesMutateDrawer
            key={`match-update-${currentRow.id}`}
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
            key={`match-delete-${currentRow.id}`}
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
            title={`Delete this item: ${currentRow.title || currentRow.id} ?`}
            desc={
              <>
                You are about to delete{' '}
                <strong>{currentRow.title || `ID ${currentRow.id}`}</strong>.{' '}
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
