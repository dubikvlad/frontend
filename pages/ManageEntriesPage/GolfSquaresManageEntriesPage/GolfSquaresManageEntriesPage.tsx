import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { routes } from '@/config/constants'
import { AccountTabs } from '@/features/components'
import { useGetPicksByEntry } from '@/helpers/hooks'

import styles from './../ManageEntriesPage.module.scss'

const PicksByMembersLazy = dynamic(
  () => import('@/features/components/PickByMembers'),
  { loading: () => <p>Loading...</p> },
)

const PoolEntriesLazy = dynamic(
  () =>
    import('@/features/components/ManageEntriesPoolEntriesSquares').then(
      (mod) => mod.ManageEntriesPoolEntriesSquares,
    ),
  { loading: () => <p>Loading...</p> },
)

const tabsData = ['Picks by members', 'Pool Entries'] as const

type TabsData = typeof tabsData[number]

export function GolfSquaresManageEntriesPage() {
  const [activeTab, setActiveTab] = useState<TabsData>('Picks by members')

  const {
    query: { poolId },
    push,
  } = useRouter()

  const { picksByEntryData, picksByEntryIsLoading } = useGetPicksByEntry(
    Number(poolId),
  )

  useEffect(() => {
    if (!picksByEntryData && !picksByEntryIsLoading && poolId) {
      push(routes.account.grid.gettingStarted(Number(poolId)))
    }
  }, [picksByEntryData, picksByEntryIsLoading, poolId, push])

  if (!picksByEntryData) return <></>

  function renderTabContent() {
    switch (activeTab) {
      case 'Picks by members':
        return <PicksByMembersLazy />
      case 'Pool Entries':
        return <PoolEntriesLazy />
    }
  }

  return (
    <>
      <h1>{activeTab}</h1>
      <p className={styles.description}>
        {activeTab === 'Picks by members' &&
          picksByEntryData &&
          `There are currently ${picksByEntryData.grids.length} grids and ${
            Object.keys(picksByEntryData.entries).length
          } entries in this pool`}
        {activeTab === 'Pool Entries' &&
          `There are currently ${
            Object.entries(picksByEntryData.entries).length
          } entries in this pool`}
      </p>
      <AccountTabs
        tabsData={tabsData}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />
      {renderTabContent()}
    </>
  )
}
