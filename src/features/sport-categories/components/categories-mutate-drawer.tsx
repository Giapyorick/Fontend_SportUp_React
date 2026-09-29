import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createCategory, updateCategory } from '@/api/categories-api'
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
// import { showSubmittedData } from '@/lib/show-submitted-data'
import { type Category } from '../data/schema'

type CategoriesMutateDrawer = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Category
  onSuccess?: () => void | Promise<void>
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  status: z.string().min(1, 'Please select a status.'),
})

type CategoryForm = z.infer<typeof formSchema>

export function CategoriesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: CategoriesMutateDrawer) {
  const isUpdate = !!currentRow
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Active',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description,
        status: currentRow.status ?? 'Active',
      })
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'Active',
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: CategoryForm) => {
    setLoading(true)
    try {
      if (isUpdate && currentRow) {
        // --- 1. UPDATE (PUT) ---
        await updateCategory(currentRow.id, data)
        toast?.success('Updated successfully!')
      } else {
        // --- 2. CREATE (POST) ---
        await createCategory(data)
        toast?.success('Created successfully!')
      }

      onOpenChange(false)
      form.reset()

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while saving the data:', error)
      toast?.error('An error occurred, please try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Item</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the details by providing necessary info.'
              : 'Add a new item by providing necessary info.'}{' '}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='categories-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* Field: Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field: Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Enter description'
                      className='resize-none'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field: Status */}
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select status'
                    items={[
                      { label: 'Active', value: 'Active' },
                      { label: 'Inactive', value: 'Inactive' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={loading}>
              Close
            </Button>
          </SheetClose>

          <Button form='categories-form' type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
