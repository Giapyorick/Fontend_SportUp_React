import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, Download } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { statuses } from '../data/data'
import { type Match } from '../data/schema'
import { MatchesMultiDeleteDialog } from './matches-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onSuccess?: () => void | Promise<void>
}

export function DataTableBulkActions<TData>({
  table,
  onSuccess,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: string) => {
    const selectedMatches = selectedRows.map(
      (row) => row.original as Match
    )
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedMatches.length} match${selectedMatches.length > 1 ? 'es' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    // 1. Get a list of selected rows
    const selectedMatches = selectedRows.map(
      (row) => row.original as Match
    )

    if (selectedMatches.length === 0) {
      toast.error('please select aleast 1 row to export!')
      return
    }

    try {
      // 2. Convert JSON data from selected rows to a sheet.
      const exportData = selectedMatches.map((item) => ({
        ID: item.id,
        'Title': item.title,
        'Sport name': item.sportCategory?.name ?? '',
        'Venue': item.venue?.name ?? '',
        'Level': item.targetLevel?.name ?? '',
        'Start': item.startTime
          ? new Date(item.startTime).toLocaleString('vi-VN')
          : '',
        'end': item.endTime
          ? new Date(item.endTime).toLocaleString('vi-VN')
          : '',
        'Total slot': item.totalSlots,
        'Available slot': item.availableSlots,
        'Price / slot (VNĐ)': item.pricePerSlot?.toLocaleString('vi-VN') ?? '0',
        'Note': item.note ?? '',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Matches')

      // 3. download file .xlsx
      const fileName = `Matches_Export_${new Date().getTime()}.xlsx`
      XLSX.writeFile(workbook, fileName)

      // 4. Uncheck the rows in the table & a success message will appear.
      table.resetRowSelection()
      toast.success(
        `Exported successfully ${selectedMatches.length} ${
          selectedMatches.length > 1 ? 'danh mục' : 'danh mục'
        }!`
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while export:', error)
      toast.error('Failed to export, please try again !')
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='match'>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update status'
                  title='Update status'
                >
                  <CircleArrowUp />
                  <span className='sr-only'>Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className='size-4 text-muted-foreground' />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='Export match'
              title='Export matches'
            >
              <Download />
              <span className='sr-only'>Export matches</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export matches</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected matches'
              title='Delete selected matches'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected matches</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected matches</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <MatchesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
        onSuccess={onSuccess}
      />
    </>
  )
}
