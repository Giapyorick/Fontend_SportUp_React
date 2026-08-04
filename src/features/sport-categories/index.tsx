import { useEffect, useState } from 'react'
// 1. Import useState, useEffect
import { getCategory } from '@/api/categories-api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CategoriesDialogs } from './components/categories-dialogs'
import { CategoriesPrimaryButtons } from './components/categories-primary-buttons'
import { CategoryProvider } from './components/categories-provider'
import { CategoriesTable } from './components/categories-table'

export function Categories() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getCategory()
        setData(result)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('An error occurred while get all sportcategory', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <CategoryProvider>
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
          <CategoriesPrimaryButtons />
        </div>

        {loading ? <div>Loading data...</div> : <CategoriesTable data={data} />}
      </Main>

      <CategoriesDialogs />
    </CategoryProvider>
  )
}
