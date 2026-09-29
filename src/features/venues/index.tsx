import { useEffect, useState, useCallback } from 'react'
import { getVenues } from '@/api/venues-api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { VenuesDialogs } from './components/venues-dialogs'
import { VenuesPrimaryButtons } from './components/venues-primary-buttons'
import { VenueProvider } from './components/venues-provider'
import { VenuesTable } from './components/venues-table'
import { type Venue } from './data/schema'

export function Venues() {
  const [data, setData] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshIndex, setRefreshIndex] = useState(0)

  // Callback làm trigger refetch cho onSuccess
  const handleSuccess = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const result = await getVenues()
        if (!ignore) {
          const formattedData: Venue[] = result.map((item) => ({
            ...item,
            address: item.address ?? '',
            mapUrl: item.mapUrl ?? '',
            status: item.status ?? 'Active',
          }))
          setData(formattedData)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('An error occurred while getting all categories:', error)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [refreshIndex])

  return (
    <VenueProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Sport categories
            </h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of sport categories!
            </p>
          </div>
          <VenuesPrimaryButtons />
        </div>

        {loading ? (
          <div>Loading data...</div>
        ) : (
          <VenuesTable data={data} onSuccess={handleSuccess} />
        )}
      </Main>

      <VenuesDialogs onSuccess={handleSuccess} />
    </VenueProvider>
  )
}
