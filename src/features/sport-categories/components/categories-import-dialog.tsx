import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { importSportCategories } from '@/api/categories-api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

//  MIME types valid to Excel
const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
]

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file.',
    })
    .refine((files) => {
      const file = files?.[0]
      if (!file) return false
      // Check file .xlsx / .xls
      return (
        EXCEL_MIME_TYPES.includes(file.type) ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      )
    }, 'Please upload Excel format (.xlsx, .xls).'),
})

type CategoryImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesImportDialog({
  open,
  onOpenChange,
}: CategoryImportDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = async () => {
    const fileList = form.getValues('file')

    if (!fileList || !fileList[0]) {
      toast.error('Please select an Excel file')
      return
    }

    const selectedFile = fileList[0]
    setLoading(true)

    try {
      const res = await importSportCategories(selectedFile)

      toast.success(res.message || 'Import Excel successfully!')

      form.reset()
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while import:', error)
      toast.error('Failed of Import. Please check the Excel file structure!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-start'>
          <DialogTitle>Import Sport Categories</DialogTitle>
          <DialogDescription>
            Import categories quickly from an Excel file (.xlsx, .xls).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='category-import-form'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='my-2'>
                  <FormLabel>File Excel</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='.xlsx, .xls'
                      {...fileRef}
                      className='h-8 py-0'
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline' disabled={loading}>
              Close
            </Button>
          </DialogClose>
          <Button type='submit' form='category-import-form' disabled={loading}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
