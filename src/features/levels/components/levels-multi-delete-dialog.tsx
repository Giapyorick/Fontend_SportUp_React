'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteMultipleLevels } from '@/api/levels-api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

type LevelMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void | Promise<void>
}

const CONFIRM_WORD = 'DELETE'

export function LevelsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: LevelMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    const selectedIds = selectedRows.map(
      (row) => (row.original as { id: number }).id
    )

    if (selectedIds.length === 0) {
      toast.error('No row has been selected !')
      return
    }

    setLoading(true)

    try {
      await deleteMultipleLevels(selectedIds)

      toast.success(`Deleted successfully ${selectedIds.length} items.`)

      setValue('')
      table.resetRowSelection()
      onOpenChange(false)

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while mutiple delete:', error)
      toast.error('An error occurred while deleting the selected items !')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setValue('')
      }}
      form='levels-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD || loading}
      isLoading={loading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'levels' : 'level'}
        </span>
      }
      desc={
        <form
          id='levels-multi-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Are you sure you want to delete the selected levels? <br />
            This action cannot be undone.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete'
      destructive
    />
  )
}
