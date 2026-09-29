import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  createMatch,
  updateMatch,
  getCategoryOptions,
  getVenueOptions,
  getLevelOptions,
  type DropdownOption,
} from '@/api/matches-api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Match } from '../data/schema'

type MatchesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Match
  onSuccess?: () => void | Promise<void>
}

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    sportCategoryId: z.string().min(1, 'Please select a sport category.'),
    venueId: z.string().min(1, 'Please select a venue.'),
    targetLevelId: z.string().min(1, 'Please select a target level.'),
    startTime: z.string().min(1, 'Start time is required.'),
    endTime: z.string().min(1, 'End time is required.'),
    totalSlots: z.number().min(1, 'Total slots must be at least 1.'),
    availableSlots: z.number().min(0, 'Available slots cannot be negative.'),
    pricePerSlot: z.number().min(0, 'Price cannot be negative.'),
    note: z.string().optional(),
  })
  // Rule 1: End Time > Start Time
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      return new Date(data.endTime) > new Date(data.startTime)
    },
    {
      message: 'End time must be after start time.',
      path: ['endTime'],
    }
  )
  // Rule 2: Total Slots >= Available Slots
  .refine(
    (data) => {
      return Number(data.totalSlots) >= Number(data.availableSlots)
    },
    {
      message: 'Total slots must be greater than or equal to available slots.',
      path: ['totalSlots'],
    }
  )

type MatchForm = z.infer<typeof formSchema>

export function MatchesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: MatchesMutateDrawerProps) {
  const isUpdate = !!currentRow
  const [loading, setLoading] = useState(false)

  const minDateTime = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])

  // Options Dropdowns
  const [categories, setCategories] = useState<DropdownOption[]>([])
  const [venues, setVenues] = useState<DropdownOption[]>([])
  const [levels, setLevels] = useState<DropdownOption[]>([])

  const form = useForm<MatchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      sportCategoryId: '',
      venueId: '',
      targetLevelId: '',
      startTime: '',
      endTime: '',
      totalSlots: 10,
      availableSlots: 10,
      pricePerSlot: 0,
      note: '',
    },
  })

  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          const [catsData, venuesData, levelsData] = await Promise.all([
            getCategoryOptions(),
            getVenueOptions(),
            getLevelOptions(),
          ])
          setCategories(catsData)
          setVenues(venuesData)
          setLevels(levelsData)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch dropdown options:', error)
          toast.error('Could not load categories or venues options.')
        }
      }
      fetchOptions()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (currentRow) {
        const formatDateTime = (dateStr?: string) => {
          if (!dateStr) return ''
          const d = new Date(dateStr)
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
          return d.toISOString().slice(0, 16)
        }

        form.reset({
          title: currentRow.title || '',
          sportCategoryId: String(currentRow.sportCategoryId || ''),
          venueId: String(currentRow.venueId || ''),
          targetLevelId: String(currentRow.targetLevelId || ''),
          startTime: formatDateTime(currentRow.startTime),
          endTime: formatDateTime(currentRow.endTime),
          totalSlots: currentRow.totalSlots ?? 10,
          availableSlots: currentRow.availableSlots ?? 10,
          pricePerSlot: currentRow.pricePerSlot ?? 0,
          note: currentRow.note || '',
        })
      } else {
        form.reset({
          title: '',
          sportCategoryId: '',
          venueId: '',
          targetLevelId: '',
          startTime: '',
          endTime: '',
          totalSlots: 10,
          availableSlots: 10,
          pricePerSlot: 0,
          note: '',
        })
      }
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: MatchForm) => {
    setLoading(true)

    const payload = {
      title: data.title,
      sportCategoryId: Number(data.sportCategoryId),
      venueId: Number(data.venueId),
      targetLevelId: Number(data.targetLevelId),
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      totalSlots: Number(data.totalSlots),
      availableSlots: Number(data.availableSlots),
      pricePerSlot: Number(data.pricePerSlot),
      note: data.note || '',
    }

    try {
      if (isUpdate && currentRow?.id) {
        await updateMatch(currentRow.id, payload)
        toast.success('Updated match successfully!')
      } else {
        await createMatch(payload)
        toast.success('Created match successfully!')
      }

      onOpenChange(false)
      form.reset()

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while saving match:', error)
      toast.error('An error occurred, please try again!')
    } finally {
      setLoading(false)
    }
  }

  const selectedStartTime = form.watch('startTime')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Match</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update match details by filling in the information below.'
              : 'Add a new match by filling in the information below.'}{' '}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='matches-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-1 pr-3'
          >
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='e.g., Friendly 5v5 Football Match'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sport Category Dropdown */}
            <FormField
              control={form.control}
              name='sportCategoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport Category</FormLabel>
                  <SelectDropdown
                    key={field.value}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select category'
                    items={categories.map((c) => ({
                      label: c.name,
                      value: String(c.id),
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Venue Dropdown */}
            <FormField
              control={form.control}
              name='venueId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <SelectDropdown
                    key={field.value}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select venue'
                    items={venues.map((v) => ({
                      label: v.name,
                      value: String(v.id),
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Level Dropdown */}
            <FormField
              control={form.control}
              name='targetLevelId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Level</FormLabel>
                  <SelectDropdown
                    key={field.value}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select target level'
                    items={levels.map((l) => ({
                      label: l.name,
                      value: String(l.id),
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Time & End Time */}
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        min={minDateTime}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        min={selectedStartTime || minDateTime}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Slots & Price */}
            <div className='grid grid-cols-3 gap-3'>
              {/* Total Slots */}
              <FormField
                control={form.control}
                name='totalSlots'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Slots</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        name={field.name}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Available Slots */}
              <FormField
                control={form.control}
                name='availableSlots'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        name={field.name}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Per Slot */}
              <FormField
                control={form.control}
                name='pricePerSlot'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price / Slot (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        step={1000}
                        name={field.name}
                        onBlur={field.onBlur}
                        disabled={field.disabled}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Special requests (e.g., Bring white shirts)'
                      className='resize-none'
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2 pt-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={loading}>
              Close
            </Button>
          </SheetClose>

          <Button form='matches-form' type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
