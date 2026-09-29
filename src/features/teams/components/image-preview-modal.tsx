import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

type ImagePreviewModalProps = {
  src?: string | null
  alt?: string
  className?: string
}

export function ImagePreviewModal({
  src,
  alt = 'Preview',
  className,
}: ImagePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) return null

  return (
    <>
      {/* Thumbnail clickable */}
      <img
        src={src}
        alt={alt}
        onClick={() => setIsOpen(true)}
        className={cn(
          'cursor-pointer object-cover transition-transform hover:scale-105',
          className
        )}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-w-3xl border-none bg-black/80 p-2 shadow-2xl backdrop-blur-md sm:rounded-2xl'>
          <DialogTitle className='sr-only'>{alt}</DialogTitle>
          <div className='flex max-h-[80vh] items-center justify-center overflow-hidden rounded-lg p-2'>
            <img
              src={src}
              alt={alt}
              className='max-h-[75vh] w-auto max-w-full rounded-md object-contain shadow-lg'
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
