import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { AccountTabs } from '@/features/components'
import { usePool } from '@/helpers'

import styles from './CommishPage.module.scss'

const GeneralManagementLazy = dynamic(
  () => import('@/features/components/GeneralPoolManagement'),
  { loading: () => <p>Loading...</p> },
)

const MembersManagementLazy = dynamic(
  () => import('@/features/components/PoolMembersManagement'),
  { loading: () => <p>Loading...</p> },
)

const PickManagementLazy = dynamic(
  () => import('@/features/components/PickManagement'),
  { loading: () => <p>Loading...</p> },
)

const XRunMLBTeamAssignmentLazy = dynamic(
  () =>
    import('@/features/components/XRunMLBTeamAssignment').then(
      (mod) => mod.XRunMLBTeamAssignment,
    ),
  { loading: () => <p>Loading...</p> },
)

const XRunTeamAssignmentLazy = dynamic(
  () =>
    import('@/features/components/XRunTeamAssignment').then(
      (mod) => mod.XRunTeamAssignment,
    ),
  { loading: () => <p>Loading...</p> },
)

const defaultAccountTabsData = ['General Pool Management', 'Pool members']

export function CommishPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(poolId ? Number(poolId) : undefined)

  const [accountTabsData, setAccountTabsData] = useState(defaultAccountTabsData)

  const [isActive, setIsActive] = useState<string>(accountTabsData[0])

  const getCurrentTab = () => {
    switch (isActive) {
      case 'General Pool Management':
        return <GeneralManagementLazy />

      case 'Pool members':
        return <MembersManagementLazy />

      case 'Pick management':
        if (
          poolData &&
          (poolData.type === 'pick_em' ||
            poolData.type === 'survivor' ||
            poolData.type === 'bracket' ||
            poolData.type === 'golf_pick_x')
        ) {
          return <PickManagementLazy />
        }
        return <></>

      case 'MLB Team Assignment':
        return <XRunMLBTeamAssignmentLazy />

      case `${poolData?.tournament?.name || ''} Team Assignment`:
        return <XRunTeamAssignmentLazy />

      default:
        return <GeneralManagementLazy />
    }
  }

  useEffect(() => {
    if (poolData) {
      const newTabs: string[] = []
      if (
        poolData.type === 'pick_em' ||
        poolData.type === 'survivor' ||
        poolData.type === 'bracket' ||
        poolData.type === 'golf_pick_x'
      ) {
        newTabs.push('Pick management')
      }

      if (poolData.type === 'xrun_mlb') {
        newTabs.push('MLB Team Assignment')
      }

      if (poolData.type === 'xrun') {
        newTabs.push(`${poolData?.tournament?.name || ''} Team Assignment`)
      }

      setAccountTabsData([...defaultAccountTabsData, ...newTabs])
    }
  }, [poolData])

  useEffect(() => {
    setIsActive(accountTabsData[0])
  }, [accountTabsData])

  if (!poolData) return null

  return (
    <div>
      <h1>Commissioner page</h1>
      <div className={styles.tableWrapper}>
        <div className={styles.tabs}>
          <AccountTabs
            tabsData={accountTabsData}
            isActive={isActive}
            setIsActive={setIsActive}
          />
        </div>

        <div>{getCurrentTab()}</div>
      </div>
    </div>
  )
}
