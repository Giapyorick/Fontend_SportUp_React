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
import { type Team } from '../data/schema'
import { TeamsMultiDeleteDialog } from './teams-multi-delete-dialog'

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
    const selectedTeams = selectedRows.map((row) => row.original as Team)
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        onSuccess?.() 
        return `Status updated to "${status}" for ${selectedTeams.length} team${selectedTeams.length > 1 ? 's' : ''}.`
      },
      error: 'Failed to update status',
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    // 1. Get a list has selected
    const selectedTeams = selectedRows.map((row) => row.original as Team)

    if (selectedTeams.length === 0) {
      toast.error('Please select at least 1 team to export!')
      return
    }

    try {
      // 2. Map data of football team to sheet Excel
      const exportData = selectedTeams.map((item) => ({
        ID: item.id,
        'Name': item.name,
        'Description': item.description,
        'Logo URL': item.logoUrl,
        'Status': item.status ?? 'Active',
        'Ngày tạo': item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('vi-VN')
          : '',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams')

      // 3. Download file .xlsx
      const fileName = `Teams_Export_${new Date().getTime()}.xlsx`
      XLSX.writeFile(workbook, fileName)

      // 4.  Uncheck the rows in the table & a success message will appear.
      table.resetRowSelection()
      toast.success(
        `Exported successfully ${selectedTeams.length} team${selectedTeams.length > 1 ? 's' : ''}!`
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while export:', error)
      toast.error('Failed to export, please try again!')
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='team'>
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
              aria-label='Export teams'
              title='Export teams'
            >
              <Download />
              <span className='sr-only'>Export teams</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export teams</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected teams'
              title='Delete selected teams'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected teams</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected teams</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TeamsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
        onSuccess={onSuccess}
      />
    </>
  )
}