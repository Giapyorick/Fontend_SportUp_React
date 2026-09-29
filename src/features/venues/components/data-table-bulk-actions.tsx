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
import { type Venue } from '../data/schema'
import { VenuesMultiDeleteDialog } from './venues-multi-delete-dialog'

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
    const selectedVenues = selectedRows.map((row) => row.original as Venue)
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedVenues.length} venue${selectedVenues.length > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    // 1. Get a list of selected rows
    const selectedVenues = selectedRows.map((row) => row.original as Venue)

    if (selectedVenues.length === 0) {
      toast.error('please select aleast 1 row to export!')
      return
    }

    try {
      // 2. Convert JSON data from selected rows to a sheet.
      const exportData = selectedVenues.map((item) => ({
        ID: item.id,
        Name: item.name,
        Address: item.address,
        Status: item.status ?? 'Active',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Venues')

      // 3. download file .xlsx
      const fileName = `Venues_Export_${new Date().getTime()}.xlsx`
      XLSX.writeFile(workbook, fileName)

      // 4. Uncheck the rows in the table & a success message will appear.
      table.resetRowSelection()
      toast.success(
        `Exported successfully ${selectedVenues.length} ${
          selectedVenues.length > 1 ? 'danh mục' : 'danh mục'
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
      <BulkActionsToolbar table={table} entityName='venue'>
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
              aria-label='Export venues'
              title='Export venues'
            >
              <Download />
              <span className='sr-only'>Export venues</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export venues</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected venues'
              title='Delete selected venues'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected venues</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected venues</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <VenuesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
        onSuccess={onSuccess}
      />
    </>
  )
}
