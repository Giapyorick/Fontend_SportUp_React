import { useEffect, useState, useCallback } from 'react'
import { getMatches } from '@/api/matches-api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MatchesDialogs } from './components/matches-dialogs'
import { MatchesPrimaryButtons } from './components/matches-primary-buttons'
import { MatchProvider } from './components/matches-provider'
import { MatchesTable } from './components/matches-table'
import { type Match } from './data/schema' 

export function Matches() {
  const [data, setData] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const handleSuccess = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const result = await getMatches()
        if (!ignore) {
          const formattedData: Match[] = result.map((item) => ({
            ...item,
            id: item.id ?? 0,
            note: item.note ?? '',
            totalSlots: item.totalSlots ?? 0,
            availableSlots: item.availableSlots ?? 0,
            pricePerSlot: item.pricePerSlot ?? 0,
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
    <MatchProvider>
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
          <MatchesPrimaryButtons />
        </div>

        {loading ? (
          <div>Loading data...</div>
        ) : (
          <MatchesTable data={data} onSuccess={handleSuccess} />
        )}
      </Main>

      <MatchesDialogs onSuccess={handleSuccess} />
    </MatchProvider>
  )
}