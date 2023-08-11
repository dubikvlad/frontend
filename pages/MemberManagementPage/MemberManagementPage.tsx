import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './MemberManagementPage.module.scss'

const MemberManagementMembers = dynamic(
  () =>
    import('@/features/components/MemberManagementMembers').then(
      (mod) => mod.MemberManagementMembers,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const MemberManagementJoinRequest = dynamic(
  () =>
    import('@/features/components/MemberManagementJoinRequest').then(
      (mod) => mod.MemberManagementJoinRequest,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

type TabsData = 'join request' | 'members'

const tabsData: TabsData[] = ['join request', 'members']

export function MemberManagementPage() {
  const [activeTab, setActiveTab] = useState<TabsData>(tabsData[0])

  return (
    <div className={styles.wrapper}>
      <h1>member management</h1>
      <AccountTabs
        tabsData={tabsData}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      {activeTab === 'members' && <MemberManagementMembers />}
      {activeTab === 'join request' && <MemberManagementJoinRequest />}
    </div>
  )
}
