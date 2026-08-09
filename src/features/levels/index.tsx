import { useEffect, useState, useCallback } from 'react'
import { getLevels } from '@/api/levels-api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LevelsDialogs } from './components/levels-dialogs'
import { LevelsPrimaryButtons } from './components/levels-primary-buttons'
import { LevelProvider } from './components/levels-provider'
import { LevelsTable } from './components/levels-table'
import { type Level } from './data/schema' 

export function Levels() {
  const [data, setData] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshIndex, setRefreshIndex] = useState(0)

 const handleSuccess = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const result = await getLevels()
        if (!ignore) {
          const formattedData: Level[] = result.map((item) => ({
            ...item,
            description: item.description ?? '',
            status: item.status ?? 'active',
          }))
          setData(formattedData)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('An error occurred while getting all levels', error)
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
    <LevelProvider>
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
              Levels
            </h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of all levels!
            </p>
          </div>
          <LevelsPrimaryButtons />
        </div>

        {loading ? (
          <div>Loading data...</div>
        ) : (
          <LevelsTable data={data} onSuccess={handleSuccess} />
        )}
      </Main>

      <LevelsDialogs onSuccess={handleSuccess} />
    </LevelProvider>
  )
}