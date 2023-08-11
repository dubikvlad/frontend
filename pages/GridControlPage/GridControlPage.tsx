import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Pool } from '@/api'
import { InfoContainer } from '@/features/components'
import { AccountTabs } from '@/features/components'
import { usePool } from '@/helpers'

import styles from './GridControlPage.module.scss'

const AllGridsLazy = dynamic(
  () =>
    import('@/features/components/GridControl/AllGrids').then(
      (mod) => mod.AllGrids,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const GridViewLazy = dynamic(
  () => import('@/features/components/GridControl').then((mod) => mod.GridView),
  {
    loading: () => <p>Loading...</p>,
  },
)

const accountTabsData = ['all grids', 'grid view'] as const

type AccountTabsData = typeof accountTabsData[number]

export function GridControlPage() {
  const [isActive, setIsActive] = useState<AccountTabsData>('all grids')

  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  return (
    <div>
      <div className={styles.head}>
        <div className={styles.title}>
          <h1>{isActive}</h1>
          <InfoContainer iconHeight={25} withInfo>
            notification
          </InfoContainer>
        </div>
        <p>
          Choose squares from the list below. Note that if you are making
          selections in the &quot;Master Grid&quot;, then it will not be
          necessary to change each grid.
        </p>
      </div>
      <AccountTabs
        tabsData={accountTabsData}
        isActive={isActive}
        setIsActive={setIsActive}
      />
      <RenderData poolData={poolData} isActive={isActive} />
    </div>
  )
}

function RenderData({
  poolData,
  isActive,
}: {
  poolData?: Pool
  isActive: AccountTabsData
}) {
  if (!poolData) return null

  switch (isActive) {
    case 'all grids':
      return <AllGridsLazy poolData={poolData} />
    case 'grid view':
      return <GridViewLazy poolData={poolData} />
    default:
      return null
  }
}
