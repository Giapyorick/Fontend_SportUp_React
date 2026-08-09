import { useEffect, useState } from 'react'
import { getTeams } from '@/api/teams-api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TeamsDialogs } from './components/teams-dialogs'
import { TeamsPrimaryButtons } from './components/teams-primary-buttons'
import { TeamsTable } from './components/teams-table'
import { TeamsProvider, useTeams } from './components/teams-provider'

function TeamsContent() {
  const { teams, setTeams } = useTeams()
  const [loading, setLoading] = useState(true)

  const handleFetchTeams = async () => {
    try {
      const result = await getTeams()
      setTeams(result)
    } catch (error) {
       // eslint-disable-next-line no-console
      console.error('An error occurred while fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleFetchTeams()
  }, [])

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Teams</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of all your teams!
            </p>
          </div>
          <TeamsPrimaryButtons />
        </div>

        {loading ? (
          <div className='flex h-32 items-center justify-center text-muted-foreground'>
            Loading data...
          </div>
        ) : (
          <TeamsTable data={teams} onSuccess={handleFetchTeams} />
        )}
      </Main>

      <TeamsDialogs onSuccess={handleFetchTeams} />
    </>
  )
}

export function Teams() {
  return (
    <TeamsProvider>
      <TeamsContent />
    </TeamsProvider>
  )
}