import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'
import { useGetPicksByEntry } from '@/helpers/hooks'

import styles from './../ManageEntriesPage.module.scss'

const PoolEntriesLazy = dynamic(
  () =>
    import('@/features/components/ManageEntriesPoolEntriesSquares').then(
      (mod) => mod.ManageEntriesPoolEntriesSquares,
    ),
  { loading: () => <p>Loading...</p> },
)

const PicksByMembersLazy = dynamic(
  () => import('@/features/components/PickByMembers'),
  { loading: () => <p>Loading...</p> },
)

type TabsData = 'Picks by members' | 'Pool Entries'

const tabsData: TabsData[] = ['Picks by members', 'Pool Entries']

export function SquaresManageEntriesPage() {
  const [activeTabs, setActiveTabs] = useState<TabsData>(tabsData[0])

  const {
    query: { poolId },
  } = useRouter()

  const { picksByEntryData } = useGetPicksByEntry(Number(poolId))

  if (!picksByEntryData) return <></>

  return (
    <>
      <h1>{activeTabs}</h1>
      <p className={styles.description}>
        {activeTabs === 'Picks by members' &&
          picksByEntryData &&
          `There are currently ${picksByEntryData.grids.length} grids and ${
            Object.keys(picksByEntryData.entries).length
          } entries in this pool`}
        {activeTabs === 'Pool Entries' &&
          `There are currently ${
            Object.entries(picksByEntryData.entries).length
          } entries in this pool`}
      </p>
      <AccountTabs
        tabsData={tabsData}
        isActive={activeTabs}
        setIsActive={setActiveTabs}
      />
      {activeTabs === 'Picks by members' && <PicksByMembersLazy />}
      {activeTabs === 'Pool Entries' && <PoolEntriesLazy />}
    </>
  )
}
