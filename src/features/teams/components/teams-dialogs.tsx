import { useState } from 'react'
import { toast } from 'sonner'
import { deleteTeam } from '@/api/teams-api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TeamsImportDialog } from './teams-import-dialog'
import { TeamsMutateDrawer } from './teams-mutate-drawer'
// 1. Import TeamsImportDialog
import { useTeams } from './teams-provider'

type TeamsDialogsProps = {
  onSuccess?: () => void | Promise<void>
}

export function TeamsDialogs({ onSuccess }: TeamsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useTeams()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!currentRow?.id) return

    setIsLoading(true)
    try {
      await deleteTeam(currentRow.id)
      toast.success(`Deleted team "${currentRow.name}" successfully!`)

      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while deleting team:', error)
      toast.error('Failed to delete team, please try again!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Drawer Create */}
      <TeamsMutateDrawer
        key='team-create'
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
        onSuccess={onSuccess}
      />

      <TeamsImportDialog
        key='team-import'
        open={open === 'import'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'import' : null)}
        onSuccess={onSuccess}
      />

      {currentRow && (
        <>
          <TeamsMutateDrawer
            key={`team-update-${currentRow.id}`}
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

          <ConfirmDialog
            key={`team-delete-${currentRow.id}`}
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
            disabled={isLoading}
            className='max-w-md'
            title={`Delete team: ${currentRow.name}?`}
            desc={
              <>
                You are about to delete{' '}
                <strong className='text-foreground'>{currentRow.name}</strong>{' '}
                (ID: {currentRow.id}).
                <br />
                This action cannot be undone.
              </>
            }
            confirmText={isLoading ? 'Deleting...' : 'Delete'}
          />
        </>
      )}
    </>
  )
}
