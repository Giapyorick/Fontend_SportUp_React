import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { ImagePreviewModal } from '@/features/teams/components/image-preview-modal'
import { statuses } from '../data/data'
import { type Team } from '../data/schema'
import { DataTableRowActions } from './teams-table-row-actions'

export const teamsColumns: ColumnDef<Team>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-12'>{row.getValue('id')}</div>,
  },

  {
    accessorKey: 'logoUrl',
    header: 'Logo',
    cell: ({ row }) => {
      const logoUrl = row.getValue('logoUrl') as string
      const name = row.getValue('name') as string

      return logoUrl ? (
        <ImagePreviewModal
          src={logoUrl}
          alt={name}
          className='h-9 w-9 rounded-full border border-border'
        />
      ) : (
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold'>
          {name?.charAt(0)?.toUpperCase() || 'T'}
        </div>
      )
    },
  },

  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },

  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='max-w-xs truncate text-muted-foreground'>
        {row.getValue('description') || '-'}
      </div>
    ),
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const statusValue = String(row.getValue('status')).toLowerCase()
      const status = statuses.find((s) => s.value.toLowerCase() === statusValue)

      if (!status) {
        return <div className='capitalize'>{statusValue}</div>
      }

      return (
        <div className='flex items-center gap-2'>
          {status.icon && (
            <status.icon className='h-4 w-4 text-muted-foreground' />
          )}
          <span className='capitalize'>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = String(row.getValue(id)).toLowerCase()
      return (value as string[]).some((v) => v.toLowerCase() === rowValue)
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
