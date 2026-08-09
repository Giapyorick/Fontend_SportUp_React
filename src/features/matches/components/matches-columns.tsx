import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Match } from '../data/schema'
import { DataTableRowActions } from './matches-table-row-actions'

export const matchesColumns: ColumnDef<Match>[] = [
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='font-medium max-w-[200px] truncate' title={row.getValue('title')}>
        {row.getValue('title')}
      </div>
    ),
  },

  {
    id: 'sportCategory',
    accessorFn: (row) => row.sportCategory?.name ?? 'N/A',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => <div>{row.getValue('sportCategory')}</div>,
  },

  {
    id: 'venue',
    accessorFn: (row) => row.venue?.name ?? 'N/A',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Venue' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate' title={row.getValue('venue')}>
        {row.getValue('venue')}
      </div>
    ),
  },

  {
    id: 'targetLevel',
    accessorFn: (row) => row.targetLevel?.name ?? 'N/A',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Level' />
    ),
    cell: ({ row }) => <div>{row.getValue('targetLevel')}</div>,
  },

  {
    id: 'slots',
    accessorFn: (row) => `${row.availableSlots}/${row.totalSlots}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slots' />
    ),
    cell: ({ row }) => {
      const available = row.original.availableSlots
      const total = row.original.totalSlots
      return (
        <div className='font-mono text-xs'>
          <span className={available > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
            {available}
          </span>
          /{total}
        </div>
      )
    },
  },

  {
    accessorKey: 'pricePerSlot',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price / Slot' />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('pricePerSlot'))
      return (
        <div className='font-medium'>
          {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Free'}
        </div>
      )
    },
  },

  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Start Time' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('startTime') as string
      if (!dateStr) return <div>N/A</div>
      return (
        <div className='text-xs whitespace-nowrap'>
          {new Date(dateStr).toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </div>
      )
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]