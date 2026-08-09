import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, ExternalLink, Navigation, Loader2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { toast } from 'sonner'
import { createVenue, updateVenue } from '@/api/venues-api'
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
import { type Venue } from '../data/schema'

// Fix Icon đường dẫn mặc định của Leaflet trong React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type VenuesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Venue
  onSuccess?: () => void | Promise<void>
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  address: z.string().min(1, 'Address is required.'),
  mapUrl: z.string().optional(),
  status: z.string().optional(),
})

type VenueForm = z.infer<typeof formSchema>

// Tách tọa độ lat,lng từ link Google Maps
const extractCoordsFromUrl = (url?: string) => {
  if (!url) return null
  const match =
    url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  return null
}

// Component hỗ trợ click chọn điểm trên bản đồ
function LocationMarker({
  position,
  setPosition,
  onSelect,
}: {
  position: { lat: number; lng: number }
  setPosition: (pos: { lat: number; lng: number }) => void
  onSelect: (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng }
      setPosition(newPos)
      onSelect(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  useEffect(() => {
    map.flyTo([position.lat, position.lng], map.getZoom())
  }, [position, map])

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={customIcon} />
  ) : null
}

export function VenuesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: VenuesMutateDrawerProps) {
  const isUpdate = !!currentRow
  const [loading, setLoading] = useState(false)
  const [fetchingAddress, setFetchingAddress] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')

  // Tọa độ mặc định: HCM (10.776889, 106.700806)
  const defaultCoords = { lat: 10.776889, lng: 106.700806 }

  // Khởi tạo state ban đầu bằng Lazy Initializer
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number }>(
    () => {
      return extractCoordsFromUrl(currentRow?.mapUrl) || defaultCoords
    }
  )

  const form = useForm<VenueForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      mapUrl: '',
      status: 'Active',
    },
  })

  // Reset form khi đóng/mở Drawer hoặc đổi currentRow
  useEffect(() => {
    if (open) {
      if (currentRow) {
        const coords = extractCoordsFromUrl(currentRow.mapUrl) || defaultCoords
        form.reset({
          name: currentRow.name || '',
          address: currentRow.address || '',
          mapUrl: currentRow.mapUrl || '',
          status: currentRow.status || 'Active',
        })

        queueMicrotask(() => {
          setMapCoords(coords)
        })
      } else {
        form.reset({
          name: '',
          address: '',
          mapUrl: '',
          status: 'Active',
        })
        queueMicrotask(() => {
          setMapCoords(defaultCoords)
        })
      }
    }
  }, [currentRow, form, open])

  // Reverse Geocoding: Đổi tọa độ lat/lng thành tên địa chỉ
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setFetchingAddress(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await res.json()
      if (data && data.display_name) {
        form.setValue('address', data.display_name, { shouldValidate: true })
        toast.success('Address auto-filled from map location!')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch address:', error)
    } finally {
      setFetchingAddress(false)
    }
  }

  // Cập nhật vị trí, gán link Google Maps chuẩn & tự động điền địa chỉ
  const handleSelectLocationOnMap = (lat: number, lng: number) => {
    setMapCoords({ lat, lng })
    const generatedUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
    form.setValue('mapUrl', generatedUrl, { shouldValidate: true })
    
    // Tự động gọi API tra cứu địa chỉ
    fetchAddressFromCoords(lat, lng)
  }

  // Định vị GPS vị trí hiện tại của thiết bị
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          handleSelectLocationOnMap(lat, lng)
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          toast.error(
            'Could not access current geolocation. Please allow location permissions.'
          )
        },
        { enableHighAccuracy: true }
      )
    } else {
      toast.error('Geolocation is not supported by your browser.')
    }
  }

  // Tìm kiếm địa điểm theo văn bản
  const handleSearchAddressOnMap = async () => {
    const query = searchLocation || form.getValues('address')
    if (!query) {
      toast.error('Please enter an address or location name to search!')
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        setMapCoords({ lat, lng })
        const generatedUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
        form.setValue('mapUrl', generatedUrl, { shouldValidate: true })
        
        if (data[0].display_name) {
          form.setValue('address', data[0].display_name, { shouldValidate: true })
        }
        toast.success('Location found and address updated!')
      } else {
        toast.error('Location not found, please try another search keyword.')
      }
    } catch {
      toast.error('Error searching location.')
    }
  }

  const onSubmit = async (data: VenueForm) => {
    setLoading(true)
    try {
      const payload = {
        name: data.name,
        address: data.address,
        mapUrl: data.mapUrl ?? '',
        status: data.status,
      }

      if (isUpdate && currentRow) {
        await updateVenue(currentRow.id, payload)
        toast.success('Updated venue successfully!')
      } else {
        await createVenue(payload)
        toast.success('Created venue successfully!')
      }

      onOpenChange(false)
      form.reset()

      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred while saving:', error)
      toast.error('An error occurred, please try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Venue</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update venue details and pick location on interactive map.'
              : 'Add a new venue and pick location on interactive map.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='venues-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 overflow-y-auto px-1 pr-3'
          >
            {/* Field: Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter venue name (e.g. Mỹ Đình Stadium)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interactive Map Section */}
            <div className='space-y-2 rounded-lg border bg-muted/30 p-3'>
              <div className='flex items-center justify-between'>
                <FormLabel className='flex items-center gap-1.5 font-semibold text-primary'>
                  <MapPin className='h-4 w-4' /> Interactive Location Picker
                </FormLabel>
                <span className='text-[10px] text-muted-foreground'>
                  (Click map to set location & auto-fill address)
                </span>
              </div>

              {/* Ô tìm kiếm & GPS */}
              <div className='flex gap-2'>
                <Input
                  placeholder='Search place or address...'
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className='h-8 text-xs'
                />
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  className='h-8 px-2 text-xs'
                  onClick={handleSearchAddressOnMap}
                >
                  <Search className='mr-1 h-3 w-3' /> Search
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8 px-2 text-xs'
                  onClick={handleGetCurrentLocation}
                  title='Get Current GPS Location'
                >
                  <Navigation className='h-3.5 w-3.5 text-blue-600' />
                </Button>
              </div>

              {/* Bản đồ tương tác Leaflet */}
              <div className='relative h-56 w-full overflow-hidden rounded-md border bg-background'>
                {open && (
                  <MapContainer
                    center={[mapCoords.lat, mapCoords.lng]}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <LocationMarker
                      position={mapCoords}
                      setPosition={setMapCoords}
                      onSelect={handleSelectLocationOnMap}
                    />
                  </MapContainer>
                )}
              </div>
            </div>

            {/* Field: Address */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Address</FormLabel>
                    {fetchingAddress && (
                      <span className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                        <Loader2 className='h-3 w-3 animate-spin text-primary' /> Auto-detecting...
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Enter physical address or click map to auto-fill'
                      className='resize-none'
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field: Map URL & Preview Link */}
            <FormField
              control={form.control}
              name='mapUrl'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Generated Google Map URL</FormLabel>
                    {field.value && (
                      <a
                        href={field.value}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-1 text-xs text-blue-600 hover:underline'
                      >
                        Preview <ExternalLink className='h-3 w-3' />
                      </a>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='https://www.google.com/maps?q=...'
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

        <SheetFooter className='gap-2 pt-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={loading}>
              Close
            </Button>
          </SheetClose>

          <Button form='venues-form' type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}