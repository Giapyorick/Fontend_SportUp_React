import { useState } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createTeam, updateTeam, type CreateTeamDto } from '@/api/teams-api'
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
import { ImagePreviewModal } from '@/features/teams/components/image-preview-modal'
import { type Team } from '../data/schema'

type TeamsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Team | null
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  status: z.string().min(1, 'Please select a status.'),
  image: z.instanceof(FileList).optional(),
})

type TeamForm = z.infer<typeof formSchema>

export function TeamsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: TeamsMutateDrawerProps) {
  const isUpdate = !!currentRow
  const [loading, setLoading] = useState(false)

  const form = useForm<TeamForm>({
    resolver: zodResolver(formSchema),
    values: open
      ? {
          name: currentRow?.name ?? '',
          description: currentRow?.description ?? '',
          status: currentRow?.status ?? 'active',
          image: undefined,
        }
      : undefined,
  })

  const watchedImage = form.watch('image')
  const selectedFile = watchedImage?.[0]

  let previewUrl: string | null = null
  if (selectedFile) {
    previewUrl = URL.createObjectURL(selectedFile)
  } else if (currentRow?.logoUrl) {
    previewUrl = currentRow.logoUrl
  }

  const onSubmit = async (data: TeamForm) => {
    setLoading(true)
    try {
      const fileToUpload = data.image?.[0] ?? null

      const payload: CreateTeamDto = {
        name: data.name,
        description: data.description,
        status: data.status,
        logoUrl: currentRow?.logoUrl ?? '',
        image: fileToUpload,
      }

      if (isUpdate && currentRow) {
        await updateTeam(currentRow.id, payload)
        toast.success('Team updated successfully!')
      } else {
        await createTeam(payload)
        toast.success('Team created successfully!')
      }

      onOpenChange(false)
      form.reset()

      onSuccess?.()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while saving the team:', error)
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          `Error: ${typeof error.response.data === 'string' ? error.response.data : 'Internal Server Error'}`
        )
      } else {
        toast.error('An error occurred, please try again!')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Team</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update team details by providing the necessary info.'
              : 'Add a new team by providing the necessary info.'}{' '}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='teams-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* Field: Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Da Nang United' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field: Upload image */}
            <FormField
              control={form.control}
              name='image'
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Team Logo</FormLabel>
                  <FormControl>
                    <div className='flex flex-col gap-2'>
                      <Input
                        type='file'
                        accept='image/*'
                        {...fieldProps}
                        onChange={(e) => onChange(e.target.files)}
                      />
                      {previewUrl && (
                        <div className='mt-1 flex items-center gap-3'>
                          {previewUrl && (
                            <div className='mt-2 flex items-center gap-3'>
                              <ImagePreviewModal
                                src={previewUrl}
                                alt='Logo preview'
                                className='h-16 w-16 rounded-md border border-border'
                              />
                            </div>
                          )}
                          <span className='text-xs text-muted-foreground'>
                            Logo Preview
                          </span>
                        </div>
                      )}
                    </div>
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
                      placeholder='Enter team description'
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
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
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

          <Button form='teams-form' type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
