import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { toast } from 'sonner'
import { deleteMultipleTeams } from '@/api/teams-api'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Team } from '../data/schema'

type TeamsMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void | Promise<void>
}

export function TeamsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: TeamsMultiDeleteDialogProps<TData>) {
  const [loading, setLoading] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedTeams = selectedRows.map((row) => row.original as Team)

  const handleDelete = async () => {
    const targetIds = selectedTeams.map((team) => team.id)
    if (!targetIds.length) return

    setLoading(true)
    try {
      const res = await deleteMultipleTeams(targetIds)

      toast.success(
        res.message || `Deleted ${targetIds.length} teams successfully!`
      )
      onOpenChange(false)

      table.resetRowSelection()

      setTimeout(async () => {
        if (onSuccess) {
          await onSuccess()
        }
      }, 50)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete teams:', error)
      toast.error('Failed to delete teams. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={loading}
      title='Delete selected teams?'
      desc={
        <>
          Are you sure you want to delete{' '}
          <span className='font-semibold text-foreground'>
            {selectedTeams.length}
          </span>{' '}
          selected team{selectedTeams.length > 1 ? 's' : ''}? This action cannot
          be undone.
        </>
      }
      confirmText={loading ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
